import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer'; // Using react-intersection-observer instead of framer-motion's useInView
import ClienteHead from './ClienteHead';
import FishboneSpine from './FishboneSpine';
import FornecedorDot from './FornecedorDot';
import EtapaDetailsModal from './EtapaDetailsModal';
import FornecedorSelectionModal from './FornecedorSelectionModal';
import FishboneCanvas from './FishboneCanvas';
import { ClienteFishboneView, FishboneZoomLevel } from '@/types/cliente-fishbone';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Maximize2, Minimize2, RotateCcw, Zap, 
  Users, Building2, AlertTriangle, Target,
  Sparkles, Waves, TrendingUp, Activity,
  Plus, Minus, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FishboneVisualizationProps {
  fishboneData: ClienteFishboneView[];
  zoomLevel: FishboneZoomLevel;
  onNodeClick?: (nodeId: string, nodeType: string) => void;
  onDataRefresh?: () => void;
}

// Animation configurations
const springConfig = {
  type: "spring",
  damping: 25,
  stiffness: 300,
  mass: 0.8
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const floatingAnimation = {
  y: [0, -8, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const glowAnimation = {
  boxShadow: [
    "0 0 0 0 rgba(59, 130, 246, 0)",
    "0 0 0 10px rgba(59, 130, 246, 0.1)",
    "0 0 0 20px rgba(59, 130, 246, 0)",
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
  }
};

const FishboneVisualization: React.FC<FishboneVisualizationProps> = ({
  fishboneData,
  zoomLevel,
  onNodeClick,
  onDataRefresh
}) => {
  const [expandedEtapas, setExpandedEtapas] = useState<Set<string>>(new Set());
  const [expandedSubniveis, setExpandedSubniveis] = useState<Set<string>>(new Set());
  const [selectedEtapa, setSelectedEtapa] = useState<any>(null);
  const [showEtapaDetails, setShowEtapaDetails] = useState(false);
  const [showFornecedorSelection, setShowFornecedorSelection] = useState(false);
  const [selectionContext, setSelectionContext] = useState<{
    clienteId: string;
    etapaId: string;
    subnivelId?: string;
  } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'standard' | 'compact' | 'detailed'>('standard');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { ref: inViewRef, inView: isInView } = useInView();
  const controls = useAnimation();
  const { toast } = useToast();

  // Animation controls utility function
  function useAnimation() {
    return {
      start: (variant: string) => {
        // Implementation for animation control
        // This is a simplified version since we can't use framer-motion directly
      }
    };
  }

  // Responsive breakpoints
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkResponsive = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    
    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    return () => window.removeEventListener('resize', checkResponsive);
  }, []);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 20
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Animation triggers
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  // Memoized calculations for performance
  const stats = useMemo(() => {
    if (!fishboneData || fishboneData.length === 0) return null;
    
    const clienteView = fishboneData[0];
    const totalFornecedores = clienteView.etapas.reduce((acc, etapa) => 
      acc + etapa.fornecedores.length + etapa.subniveis.reduce((subAcc, sub) => 
        subAcc + sub.fornecedores.length, 0), 0);
    
    const totalParceiros = clienteView.etapas.reduce((acc, etapa) => 
      acc + etapa.fornecedores.filter(f => f.is_parceiro).length + 
      etapa.subniveis.reduce((subAcc, sub) => 
        subAcc + sub.fornecedores.filter(f => f.is_parceiro).length, 0), 0);

    const etapasComCobertura = clienteView.etapas.filter(etapa => 
      etapa.fornecedores.length > 0 || etapa.subniveis.some(sub => sub.fornecedores.length > 0));

    const coberturaPorcentual = Math.round((etapasComCobertura.length / clienteView.etapas.length) * 100);
    
    const gapsCount = clienteView.etapas.length - etapasComCobertura.length;
    const criticalGaps = clienteView.etapas.filter(etapa => 
      etapa.fornecedores.length === 0 && 
      etapa.subniveis.every(sub => sub.fornecedores.length === 0) &&
      etapa.gaps > 0
    ).length;

    return {
      totalEtapas: clienteView.etapas.length,
      totalFornecedores,
      totalParceiros,
      coberturaPorcentual,
      gapsCount,
      criticalGaps,
      healthScore: Math.round((totalParceiros / Math.max(totalFornecedores, 1)) * 100),
      diversityIndex: Math.min(clienteView.etapas.length, 10) * 10
    };
  }, [fishboneData]);

  const handleToggleEtapa = useCallback((etapaId: string) => {
    setIsLoading(true);
    
    setTimeout(() => {
      const newExpanded = new Set(expandedEtapas);
      if (newExpanded.has(etapaId)) {
        newExpanded.delete(etapaId);
      } else {
        newExpanded.add(etapaId);
      }
      setExpandedEtapas(newExpanded);
      setIsLoading(false);
    }, 150);
  }, [expandedEtapas]);

  const handleToggleSubnivel = useCallback((subnivelId: string) => {
    const newExpanded = new Set(expandedSubniveis);
    if (newExpanded.has(subnivelId)) {
      newExpanded.delete(subnivelId);
    } else {
      newExpanded.add(subnivelId);
    }
    setExpandedSubniveis(newExpanded);
  }, [expandedSubniveis]);

  const handleShowEtapaDetails = useCallback((etapa: any) => {
    setSelectedEtapa(etapa);
    setShowEtapaDetails(true);
  }, []);

  const handleAddFornecedor = useCallback((context: { clienteId: string; etapaId: string; subnivelId?: string }) => {
    setSelectionContext(context);
    setShowFornecedorSelection(true);
  }, []);

  // This function adapts the context format to the expected etapaId, subnivelId format
  const handleAddFornecedorAdapter = useCallback((etapaId: string, subnivelId?: string) => {
    if (fishboneData && fishboneData.length > 0) {
      handleAddFornecedor({
        clienteId: fishboneData[0].cliente.id,
        etapaId,
        subnivelId
      });
    }
  }, [fishboneData, handleAddFornecedor]);

  // This function handles editing a fornecedor
  const handleEditFornecedor = useCallback((fornecedorId: string, etapaId: string, subnivelId?: string) => {
    // Implement edit fornecedor logic here
    console.log("Edit fornecedor", fornecedorId, etapaId, subnivelId);
    // For now, just show a toast
    toast({
      title: "Edição de fornecedor",
      description: `Fornecedor: ${fornecedorId}`,
      duration: 2000,
    });
  }, [toast]);

  const handleNodeClick = useCallback((nodeId: string, nodeType: string) => {
    onNodeClick?.(nodeId, nodeType);
    
    // Visual feedback
    toast({
      title: "Nó selecionado",
      description: `${nodeType}: ${nodeId}`,
      duration: 2000,
    });
  }, [onNodeClick, toast]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const resetView = useCallback(() => {
    setExpandedEtapas(new Set());
    setExpandedSubniveis(new Set());
    setViewMode('standard');
    controls.start({
      scale: 1,
      x: 0,
      y: 0,
      transition: springConfig
    });
  }, [controls]);

  if (!fishboneData || fishboneData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springConfig}
        className={cn(
          "relative overflow-hidden rounded-xl border bg-gradient-to-br from-background via-background to-muted/20",
          "flex items-center justify-center min-h-[400px] lg:min-h-[600px]",
          isFullscreen && "fixed inset-0 z-50 min-h-screen bg-background"
        )}
        ref={(node) => {
          // Assign to both refs
          containerRef.current = node;
          inViewRef(node);
        }}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse" />
          <motion.div
            animate={{ 
              background: [
                "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 40% 60%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0"
          />
        </div>

        <motion.div
          animate={floatingAnimation}
          className="text-center space-y-6 z-10"
        >
          <motion.div
            animate={pulseAnimation}
            className="mx-auto w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
          >
            <Target className="h-10 w-10 lg:h-12 lg:w-12 text-white" />
          </motion.div>
          
          <div className="space-y-2">
            <h3 className="text-lg lg:text-xl font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Selecione um cliente
            </h3>
            <p className="text-sm lg:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              Escolha um cliente no painel lateral para visualizar sua jornada interativa em espinha de peixe
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center space-x-2 text-xs text-muted-foreground"
          >
            <Sparkles className="h-4 w-4" />
            <span>Visualização inteligente e responsiva</span>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  const clienteView = fishboneData[0];
  const centerX = isMobile ? 200 : isTablet ? 300 : 400;
  const centerY = isMobile ? 200 : isTablet ? 250 : 300;

  return (
    <motion.div
      ref={(node) => {
        // Assign to both refs
        containerRef.current = node;
        inViewRef(node);
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={springConfig}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-gradient-to-br from-background via-background to-muted/10",
        isFullscreen && "fixed inset-0 z-50 bg-background"
      )}
    >
      {/* Interactive background with mouse tracking */}
      <motion.div
        animate={{
          background: `radial-gradient(circle at ${50 + mousePosition.x}% ${50 + mousePosition.y}%, rgba(59, 130, 246, 0.05) 0%, transparent 70%)`
        }}
        transition={{ type: "spring", damping: 30 }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Floating control panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute top-4 right-4 z-20 flex items-center space-x-2"
      >
        <AnimatePresence>
          {stats && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="hidden lg:flex items-center space-x-3 bg-background/80 backdrop-blur-sm border rounded-full px-4 py-2 shadow-lg"
            >
              <div className="flex items-center space-x-1 text-xs">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="font-medium">{stats.coberturaPorcentual}%</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center space-x-1 text-xs text-blue-600">
                <Users className="h-3 w-3" />
                <span>{stats.totalParceiros}</span>
              </div>
              {stats.criticalGaps > 0 && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center space-x-1 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{stats.criticalGaps}</span>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={resetView}
            className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </motion.div>
      </motion.div>

      {/* Loading overlay with modern spinner */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/50 backdrop-blur-sm z-30 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <div className="w-12 h-12 border-4 border-muted rounded-full" />
              <div className="absolute inset-0 w-12 h-12 border-4 border-t-primary rounded-full" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main visualization area */}
      <motion.div
        ref={canvasRef}
        className={cn(
          "relative w-full transition-all duration-300",
          isFullscreen ? "h-screen" : "h-[400px] lg:h-[600px]",
          isMobile && "h-[350px]"
        )}
        style={{
          background: viewMode === 'detailed' 
            ? 'radial-gradient(circle at center, rgba(59, 130, 246, 0.02) 0%, transparent 70%)'
            : undefined
        }}
      >
        <FishboneCanvas
          fishboneData={fishboneData}
          zoomLevel={zoomLevel}
          onNodeClick={handleNodeClick}
        >
          {/* Cliente central com animações aprimoradas */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, ...springConfig }}
          >
            <motion.g
              animate={glowAnimation}
              whileHover={{ scale: 1.05 }}
              onHoverStart={() => setHoveredNode('cliente')}
              onHoverEnd={() => setHoveredNode(null)}
            >
              <ClienteHead
                cliente={clienteView.cliente}
                position={{ x: centerX, y: centerY }}
                stats={stats}
                // Corrected: ClienteHead needs the handleNodeClick instead of onClick
                handleNodeClick={() => handleNodeClick(clienteView.cliente.id, 'cliente')}
              />
            </motion.g>
          </motion.g>

          {/* Etapas com animações escalonadas */}
          <AnimatePresence>
            {clienteView.etapas.map((etapa, index) => {
              const angle = (index * 2 * Math.PI) / clienteView.etapas.length;
              const radius = isMobile ? 120 : isTablet ? 150 : 180;
              const spinePosition = {
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
              };

              return (
                <motion.g
                  key={etapa.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ 
                    delay: 0.5 + (index * 0.1),
                    ...springConfig 
                  }}
                >
                  <motion.g
                    whileHover={{ scale: 1.02 }}
                    onHoverStart={() => setHoveredNode(etapa.id)}
                    onHoverEnd={() => setHoveredNode(null)}
                    animate={hoveredNode === etapa.id ? { 
                      filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))" 
                    } : {}}
                  >
                    <FishboneSpine
                      etapa={etapa}
                      isExpanded={expandedEtapas.has(etapa.id)}
                      onToggleExpanded={() => handleToggleEtapa(etapa.id)}
                      onShowDetails={() => handleShowEtapaDetails(etapa)}
                      position={spinePosition}
                      angle={angle}
                    />
                  </motion.g>

                  {/* Fornecedores com animações de partículas */}
                  <AnimatePresence>
                    {(zoomLevel.showAllFornecedores || expandedEtapas.has(etapa.id)) && (
                      <>
                        {etapa.fornecedores.map((fornecedor, fIndex) => {
                          const fornecedorAngle = angle + (fIndex - etapa.fornecedores.length / 2) * 0.3;
                          const fornecedorRadius = radius + 40;
                          const fornecedorPosition = {
                            x: centerX + Math.cos(fornecedorAngle) * fornecedorRadius,
                            y: centerY + Math.sin(fornecedorAngle) * fornecedorRadius
                          };

                          return (
                            <motion.g
                              key={`${fornecedor.id}-${fIndex}`}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ 
                                delay: 0.7 + (fIndex * 0.05),
                                ...springConfig 
                              }}
                            >
                              <motion.g
                                whileHover={{ 
                                  scale: 1.2,
                                  transition: { duration: 0.2 }
                                }}
                                animate={fornecedor.is_parceiro ? pulseAnimation : {}}
                              >
                                <FornecedorDot
                                  fornecedor={fornecedor}
                                  position={fornecedorPosition}
                                  onDoubleClick={() => handleAddFornecedor({
                                    clienteId: clienteView.cliente.id,
                                    etapaId: etapa.id
                                  })}
                                />
                              </motion.g>
                            </motion.g>
                          );
                        })}

                        {/* Subníveis expandidos */}
                        {etapa.subniveis.map((subnivel, sIndex) => (
                          <AnimatePresence key={subnivel.id}>
                            {expandedSubniveis.has(subnivel.id) && 
                              subnivel.fornecedores.map((fornecedor, fIndex) => {
                                const subAngle = angle + (sIndex - etapa.subniveis.length / 2) * 0.2;
                                const subRadius = radius + 80;
                                const subPosition = {
                                  x: centerX + Math.cos(subAngle) * subRadius,
                                  y: centerY + Math.sin(subAngle) * subRadius
                                };

                                return (
                                  <motion.g
                                    key={`${subnivel.id}-${fornecedor.id}-${fIndex}`}
                                    initial={{ scale: 0, opacity: 0, x: spinePosition.x, y: spinePosition.y }}
                                    animate={{ 
                                      scale: 1, 
                                      opacity: 1, 
                                      x: subPosition.x, 
                                      y: subPosition.y 
                                    }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ 
                                      delay: 0.8 + (fIndex * 0.03),
                                      ...springConfig 
                                    }}
                                  >
                                    <FornecedorDot
                                      fornecedor={fornecedor}
                                      position={{ x: 0, y: 0 }}
                                      onDoubleClick={() => handleAddFornecedor({
                                        clienteId: clienteView.cliente.id,
                                        etapaId: etapa.id,
                                        subnivelId: subnivel.id
                                      })}
                                    />
                                  </motion.g>
                                );
                              })
                            }
                          </AnimatePresence>
                        ))}
                      </>
                    )}
                  </AnimatePresence>
                </motion.g>
              );
            })}
          </AnimatePresence>

          {/* Conexões dinâmicas entre nós */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ delay: 1 }}
          >
            {clienteView.etapas.map((etapa, index) => {
              const angle = (index * 2 * Math.PI) / clienteView.etapas.length;
              const radius = isMobile ? 120 : isTablet ? 150 : 180;
              const endX = centerX + Math.cos(angle) * radius;
              const endY = centerY + Math.sin(angle) * radius;

              return (
                <motion.line
                  key={`connection-${etapa.id}`}
                  x1={centerX}
                  y1={centerY}
                  x2={endX}
                  y2={endY}
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeDasharray="2,4"
                  className="text-muted-foreground/30"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ 
                    delay: 0.8 + (index * 0.1),
                    duration: 0.8
                  }}
                />
              );
            })}
          </motion.g>
        </FishboneCanvas>
      </motion.div>

      {/* Bottom stats bar - responsivo */}
      {stats && !isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-4 left-4 right-4 z-10"
        >
          <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center space-y-1"
                >
                  <div className="text-2xl font-bold text-primary">{stats.coberturaPorcentual}%</div>
                  <div className="text-xs text-muted-foreground">Cobertura</div>
                  <Progress value={stats.coberturaPorcentual} className="h-1" />
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center space-y-1"
                >
                  <div className="text-2xl font-bold text-green-600">{stats.totalParceiros}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Users className="h-3 w-3" />
                    Parceiros
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center space-y-1"
                >
                  <div className="text-2xl font-bold text-blue-600">{stats.totalFornecedores}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Fornecedores
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center space-y-1"
                >
                  <div className="text-2xl font-bold text-orange-600">{stats.healthScore}%</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Activity className="h-3 w-3" />
                    Saúde
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Mobile stats - versão compacta */}
      {stats && isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-4 left-4 right-4 z-10"
        >
          <Card className="bg-background/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">{stats.coberturaPorcentual}%</div>
                    <div className="text-xs text-muted-foreground">Cobertura</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{stats.totalParceiros}</div>
                    <div className="text-xs text-muted-foreground">Parceiros</div>
                  </div>
                </div>
                
                {stats.criticalGaps > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {stats.criticalGaps} Gap{stats.criticalGaps > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Modals with enhanced animations */}
      <AnimatePresence>
        {showEtapaDetails && selectedEtapa && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={springConfig}
            >
              <EtapaDetailsModal
                etapa={selectedEtapa}
                isOpen={showEtapaDetails}
                onClose={() => setShowEtapaDetails(false)}
                onAddFornecedor={handleAddFornecedorAdapter}
                onEditFornecedor={handleEditFornecedor}
              />
            </motion.div>
          </motion.div>
        )}

        {showFornecedorSelection && selectionContext && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={springConfig}
            >
              <FornecedorSelectionModal
                clienteId={selectionContext.clienteId}
                etapaId={selectionContext.etapaId}
                subnivelId={selectionContext.subnivelId}
                isOpen={showFornecedorSelection}
                onClose={() => setShowFornecedorSelection(false)}
                onSelect={(fornecedorId) => {
                  setShowFornecedorSelection(false);
                  onDataRefresh?.();
                  toast({
                    title: "✅ Fornecedor adicionado",
                    description: "O fornecedor foi adicionado com sucesso à etapa.",
                    duration: 3000,
                  });
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FishboneVisualization;