// Build-only compatibility for hosts without /proc. Normal hosts use native stats.
const v8=require('node:v8');
const native=process.memoryUsage;
try{native()}catch(e){if(e.syscall!=='uv_resident_set_memory')throw e;
 const fallback=()=>{const h=v8.getHeapStatistics();return {rss:h.total_heap_size,heapTotal:h.total_heap_size,heapUsed:h.used_heap_size,external:h.external_memory,arrayBuffers:0}};
 fallback.rss=()=>fallback().rss;process.memoryUsage=fallback;
}
