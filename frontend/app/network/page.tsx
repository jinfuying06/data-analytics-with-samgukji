"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { NetworkData } from "@/lib/api";

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
  const router = useRouter();

  useEffect(() => {
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
    <div className="network-page">
      <div className="network-header">
        <div>
          <p className="eyebrow">TACTICAL MAP / SOURCE 02</p>
          <h1 className="page-title">연의 인물 관계망</h1>
          <p className="page-subtitle">같은 회차에 함께 등장한 인물들의 연결을 지도처럼 탐색합니다.</p>
        </div>
        <div className="map-legend"><span className="legend-dot" /> 공동등장 회차</div>
      </div>

      <div className="network-layout">
        <aside className="network-controls pixel-panel">
          <p className="eyebrow">MAP SETTINGS</p>
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
          <div className="canvas-label">三國志 / CHAPTER CONNECTIONS</div>
          {data ? (
            <ForceGraph2D
              graphData={data}
              nodeId="id"
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
  );
}
