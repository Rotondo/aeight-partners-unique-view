import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { QuadrantPoint } from "@/types";
import { usePrivacy } from "@/contexts/PrivacyContext";

const Tooltip = ({
  tooltipData,
  position,
  isDemoMode,
}: {
  tooltipData: QuadrantPoint | null;
  position: { x: number; y: number };
  isDemoMode: boolean;
}) => {
  if (!tooltipData) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: position.x + 12,
        top: position.y + 12,
        padding: "8px 12px",
        background: "rgba(30,41,59,0.96)",
        color: "#fff",
        borderRadius: "5px",
        fontSize: "13px",
        pointerEvents: "none",
        zIndex: 1000,
        maxWidth: 260,
        boxShadow: "0 2px 8px 0 #0005",
      }}
    >
      <strong>
        {isDemoMode ? "" : tooltipData.nome}
      </strong>
      <div style={{ marginTop: 4 }}>
        <div>
          <b>Engajamento:</b> {tooltipData.engajamento}
        </div>
        <div>
          <b>Tamanho:</b> {tooltipData.tamanho}
        </div>
        <div>
          <b>X:</b> {tooltipData.x.toFixed(2)} <b>Y:</b> {tooltipData.y.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

interface QuadranteChartProps {
  data: QuadrantPoint[];
  isLoading: boolean;
  onPointClick?: (pointId: string) => void;
  selectedId?: string | null;
}

const getBubbleSize = (partner: QuadrantPoint, selected: boolean) => {
  if (selected) return 16;
  if ((partner.tamanho === "PP" || partner.tamanho === "P") && partner.engajamento <= 2) {
    return 4;
  }
  if (partner.engajamento >= 4 && partner.x >= 4) {
    return 7;
  }
  return 5;
};

const QuadranteChart: React.FC<QuadranteChartProps> = ({
  data,
  isLoading,
  onPointClick,
  selectedId,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const hoverLayerRef = useRef<SVGGElement | null>(null);
  const [tooltip, setTooltip] = React.useState<{
    point: QuadrantPoint | null;
    pos: { x: number; y: number };
  }>({ point: null, pos: { x: 0, y: 0 } });

  const { isDemoMode } = usePrivacy();

  useEffect(() => {
    if (isLoading || !data.length || !svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 5]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 5]).range([height, 0]);

    chart
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));
    chart.append("g").call(d3.axisLeft(yScale));

    chart
      .append("text")
      .attr("class", "x-axis-label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 5)
      .style("fontSize", "12px")
      .text("Potencial de Geração de Leads (0-5)");

    chart
      .append("text")
      .attr("class", "y-axis-label")
      .attr("text-anchor", "middle")
      .attr(
        "transform",
        `translate(${-margin.left + 15},${height / 2}) rotate(-90)`
      )
      .style("fontSize", "12px")
      .text("Potencial de Investimento (0-5)");

    const quadrantX = 2.5;
    const quadrantY = 2.5;
    chart
      .append("line")
      .attr("x1", xScale(quadrantX))
      .attr("y1", 0)
      .attr("x2", xScale(quadrantX))
      .attr("y2", height)
      .attr("stroke", "#94a3b8")
      .attr("stroke-dasharray", "4");
    chart
      .append("line")
      .attr("x1", 0)
      .attr("y1", yScale(quadrantY))
      .attr("x2", width)
      .attr("y2", yScale(quadrantY))
      .attr("stroke", "#94a3b8")
      .attr("stroke-dasharray", "4");

    chart
      .append("text")
      .attr("x", width - 10)
      .attr("y", 15)
      .attr("text-anchor", "end")
      .attr("fill", "#64748b")
      .attr("font-size", 11)
      .text("Alta geração / Alto investimento");

    chart
      .append("text")
      .attr("x", width - 10)
      .attr("y", height - 10)
      .attr("text-anchor", "end")
      .attr("fill", "#64748b")
      .attr("font-size", 11)
      .text("Alta geração / Baixo investimento");

    chart
      .append("text")
      .attr("x", 10)
      .attr("y", 15)
      .attr("text-anchor", "start")
      .attr("fill", "#64748b")
      .attr("font-size", 11)
      .text("Baixa geração / Alto investimento");

    chart
      .append("text")
      .attr("x", 10)
      .attr("y", height - 10)
      .attr("text-anchor", "start")
      .attr("fill", "#64748b")
      .attr("font-size", 11)
      .text("Baixa geração / Baixo investimento");

    const tamanhoColorMap: Record<string, string> = {
      PP: "#38bdf8",
      P: "#2dd4bf",
      M: "#4ade80",
      G: "#facc15",
      GG: "#f97316",
    };

    // Ajuste labels para ficarem sempre dentro do gráfico
    const labelPadding = 10;
    const labelData = data.map((d) => {
      const nomeLabel = isDemoMode ? "" : d.nome;
      let x = xScale(d.x) + labelPadding;
      let y = yScale(d.y) - labelPadding;
      const widthLabel = nomeLabel.length * 7.2 + 14;
      const heightLabel = 18;

      if (x + widthLabel > width) x = xScale(d.x) - widthLabel - labelPadding;
      if (x < 0) x = 2;
      if (y - heightLabel < 0) y = yScale(d.y) + heightLabel;
      if (y > height) y = height - 4;

      return {
        ...d,
        nomeLabel,
        labelX: x,
        labelY: y,
        width: widthLabel,
        height: heightLabel,
      };
    });

    const overlapping = new Set<number>();
    for (let i = 0; i < labelData.length; i++) {
      const a = labelData[i];
      for (let j = i + 1; j < labelData.length; j++) {
        const b = labelData[j];
        if (
          a.labelX < b.labelX + b.width &&
          a.labelX + a.width > b.labelX &&
          a.labelY < b.labelY + b.height &&
          a.labelY + a.height > b.labelY
        ) {
          overlapping.add(i);
          overlapping.add(j);
        }
      }
    }

    const hasSelection = !!selectedId;

    chart
      .selectAll(".point-label")
      .data(labelData)
      .enter()
      .append("text")
      .attr("class", "point-label")
      .attr("x", (d) => d.labelX)
      .attr("y", (d) => d.labelY)
      .attr("fontSize", 13)
      .attr("fill", (d, i) =>
        hasSelection && d.id === selectedId
          ? "#0ea5e9"
          : hasSelection
          ? "#cbd5e1"
          : "#334155"
      )
      .attr("fontWeight", (d) =>
        hasSelection && d.id === selectedId ? 700 : 400
      )
      .attr("pointer-events", "none")
      .attr("opacity", (d) =>
        hasSelection && d.id !== selectedId ? 0.6 : 1
      )
      .text((d, i) => (!overlapping.has(i) ? d.nomeLabel : ""))
      .style("user-select", "none");

    const pointsGroup = chart.append("g").attr("class", "points-group");

    pointsGroup
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", (d) => getBubbleSize(d, hasSelection && d.id === selectedId))
      .attr("fill", (d) =>
        hasSelection && d.id === selectedId
          ? tamanhoColorMap[d.tamanho] || "#38bdf8"
          : hasSelection
          ? "#cbd5e1"
          : tamanhoColorMap[d.tamanho] || "#38bdf8"
      )
      .attr("opacity", (d) =>
        hasSelection && d.id !== selectedId ? 0.4 : 1
      )
      .attr("stroke", (d) =>
        hasSelection && d.id === selectedId
          ? "#0ea5e9"
          : hasSelection
          ? "#94a3b8"
          : "#334155"
      )
      .attr("stroke-width", (d) =>
        hasSelection && d.id === selectedId ? 4 : 1.2
      )
      .attr("cursor", onPointClick ? "pointer" : "default")
      .on("mouseover", function (event, d) {
        const i = data.findIndex((p) => p.id === d.id);
        setTooltip({
          point: d,
          pos: { x: event.clientX, y: event.clientY },
        });

        if (overlapping.has(i) && !isDemoMode) {
          d3.select(hoverLayerRef.current).selectAll("*").remove();
          d3.select(hoverLayerRef.current)
            .append("line")
            .attr("x1", xScale(d.x))
            .attr("y1", yScale(d.y))
            .attr("x2", labelData[i].labelX)
            .attr("y2", labelData[i].labelY)
            .attr("stroke", "#334155")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "2,2");
          d3.select(hoverLayerRef.current)
            .append("text")
            .attr("x", labelData[i].labelX)
            .attr("y", labelData[i].labelY)
            .attr("fontSize", 13)
            .attr("fill", "#0f172a")
            .attr("fontWeight", 600)
            .text(isDemoMode ? "" : d.nome)
            .style("user-select", "none")
            .attr("pointer-events", "none");
        }
        d3.select(this)
          .transition()
          .duration(90)
          .attr("r", getBubbleSize(d, hasSelection && d.id === selectedId) + 2)
          .attr("stroke-width", hasSelection && d.id === selectedId ? 5 : 2.2);
      })
      .on("mousemove", function (event) {
        setTooltip((t) =>
          t.point ? { ...t, pos: { x: event.clientX, y: event.clientY } } : t
        );
      })
      .on("mouseout", function (event, d) {
        d3.select(hoverLayerRef.current).selectAll("*").remove();
        setTooltip({ point: null, pos: { x: 0, y: 0 } });
        d3.select(this)
          .transition()
          .duration(90)
          .attr("r", getBubbleSize(d, hasSelection && d.id === selectedId))
          .attr("stroke-width", hasSelection && d.id === selectedId ? 4 : 1.2);
      })
      .on("click", (event, d) => {
        if (onPointClick) onPointClick(d.id);
      });

    let hoverLayer = chart.select(".hover-layer");
    if (!hoverLayer.size()) {
      hoverLayer = chart.append("g").attr("class", "hover-layer");
    }
    hoverLayerRef.current = hoverLayer.node();
  }, [data, isLoading, onPointClick, selectedId, isDemoMode]);

  return (
    <div style={{ position: "relative", width: "100%", height: 420 }}>
      <svg
        ref={svgRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          background: "#f1f5f9",
          borderRadius: 8,
        }}
      />
      <Tooltip tooltipData={tooltip.point} position={tooltip.pos} isDemoMode={isDemoMode} />
    </div>
  );
};

export default QuadranteChart;
