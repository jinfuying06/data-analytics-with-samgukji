"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { NetworkData } from "@/lib/api";

import SiteHeader from "@/components/SiteHeader";
import snapshot from "@/lib/network-snapshot.json";
import people from "@/lib/person-snapshot.json";

const FACTION_COLOR: Record<string, string> = { 魏: "#e8566a", 吳: "#8f8cf2", 蜀: "#6fc98f" };
const factionOf = new Map(people.map((p) => [p.name, p.jeongsa?.country ?? ""]));
const colorOf = (id: string) => FACTION_COLOR[factionOf.get(id) ?? ""] ?? "#8e9399";

type GraphNode = NetworkData["nodes"][number];
type GraphLink = NetworkData["links"][number];

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export default function NetworkPage() {
  const [minCount, setMinCount] = useState(5);
  const [data, setData] = useState<NetworkData | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 880, height: 600 });
  const canvasRef = useRef<HTMLElement>(null);
  const graphRef = useRef<{ zoomToFit: (ms?: number, padding?: number) => void } | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    if(process.env.NEXT_PUBLIC_STATIC_PROTOTYPE === "1") {
      const links=snapshot.links.filter(l=>l.value>=minCount);
      const ids=new Set(links.flatMap(l=>[l.source,l.target]));
      setData({nodes:snapshot.nodes.filter(n=>ids.has(n.id)),links}); return;
    }
    fetch(`/api/network?min_count=${minCount}`)
      .then((r) => r.json())
      .then(setData);
  }, [minCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeGraph = () => {
      const width = Math.floor(canvas.getBoundingClientRect().width);
      setCanvasSize({
        width: Math.max(280, width),
        height: width < 600 ? 440 : 600,
      });
    };

    resizeGraph();
    const observer = new ResizeObserver(resizeGraph);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return (
    <>
    <SiteHeader current="network" />
    <div className="network-page">
      <div className="network-header">
        <div>
          <p className="eyebrow">관계망 / 자료 2</p>
          <h1 className="page-title">연의 인물 관계망</h1>
          <p className="page-subtitle">같은 회차에 함께 등장한 인물들의 연결을 지도처럼 탐색합니다.</p>
        </div>
        <div className="map-legend"><span><i className="legend-dot wei" />위</span><span><i className="legend-dot wu" />오</span><span><i className="legend-dot shu" />촉</span></div>
      </div>

      <div className="network-layout">
        <aside className="network-controls pixel-panel">
          <p className="eyebrow">지도 설정</p>
          <h2>관계망 필터</h2>
          <label className="range-label">
            <span>최소 공동등장 회차</span>
            <strong>{minCount}회</strong>
            <input
              type="range"
              min={1}
              max={20}
              value={minCount}
              onChange={(e) => setMinCount(Number(e.target.value))}
            />
          </label>
          <div className="range-scale"><span>전체 연결</span><span>핵심 연결</span></div>
          {data && (
            <div className="map-counts">
              <div><strong>{data.nodes.length}</strong><span>인물 노드</span></div>
              <div><strong>{data.links.length}</strong><span>연결 선</span></div>
            </div>
          )}
          <p className="control-note">노드를 클릭하면 해당 장수의 도감으로 이동합니다.</p>
        </aside>

        <section className="network-canvas paper-panel" ref={canvasRef}>
          <div className="canvas-label">三國志 / 회차 연결</div>
          {data ? (
            <ForceGraph2D
              ref={graphRef as never}
              cooldownTicks={120}
              onEngineStop={() => graphRef.current?.zoomToFit(400, 60)}
              graphData={data}
              nodeId="id"
              backgroundColor="rgba(0,0,0,0)"
              nodeColor={(n: object) => colorOf((n as GraphNode).id)}
              linkColor={() => "rgba(236,228,212,0.16)"}
              nodeCanvasObjectMode={() => "after"}
              nodeCanvasObject={(n: object, ctx: CanvasRenderingContext2D, scale: number) => {
                const node = n as GraphNode & { x?: number; y?: number };
                if (scale < 1.4 && node.count < 20) return;
                ctx.font = `${12 / scale}px "IBM Plex Sans KR", sans-serif`;
                ctx.textAlign = "center";
                ctx.fillStyle = "#ece4d4";
                ctx.fillText(node.id, node.x ?? 0, (node.y ?? 0) + 10 / scale);
              }}
              nodeLabel={(n: object) => {
                const node = n as GraphNode;
                return `${node.id} (${node.count}회 등장)`;
              }}
              nodeVal={(n: object) => Math.max(1, (n as GraphNode).count / 5)}
              linkWidth={(l: object) => Math.max(1, (l as GraphLink).value / 10)}
              onNodeClick={(n: object) =>
                router.push(`/person/${encodeURIComponent((n as GraphNode).id)}`)
              }
              width={canvasSize.width}
              height={canvasSize.height}
            />
          ) : (
            <div className="empty-state">관계망을 불러오는 중...</div>
          )}
        </section>
      </div>
    </div>
    </>
  );
}
