import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  ConnectionLineType,
  Panel,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Form, Question } from '@/lib/types';
import { StartNode, QuestionNode, EndNode } from './CustomNodes';
import { useTheme } from '@/components/ThemeProvider';

const nodeTypes = {
  start: StartNode,
  question: QuestionNode,
  end: EndNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  dagreGraph.setGraph({ rankdir: direction, align: 'DL', nodesep: 60, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 220, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = direction === 'LR' ? Position.Left : Position.Top;
    node.sourcePosition = direction === 'LR' ? Position.Right : Position.Bottom;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - 220 / 2,
      y: nodeWithPosition.y - 100 / 2,
    };

    return node;
  });

  return { nodes, edges };
};

interface WorkflowCanvasProps {
  form: Form;
  onUpdate: (form: Form) => void;
}

export function WorkflowCanvas({ form, onUpdate }: WorkflowCanvasProps) {
  const { isDark } = useTheme();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isLayouting, setIsLayouting] = useState(false);

  // Initialize nodes and edges from form
  useEffect(() => {
    if (isLayouting) return; // don't interrupt active drag
    
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Start Node
    newNodes.push({
      id: 'start',
      type: 'start',
      position: { x: 0, y: 0 },
      data: { label: 'Start' },
      draggable: false,
    });

    // Question Nodes
    form.questions.forEach((q, index) => {
      newNodes.push({
        id: q.id,
        type: 'question',
        position: { x: 0, y: 0 },
        data: { ...q, orderIndex: index },
        draggable: true,
      });

      // Edge from previous to this
      newEdges.push({
        id: `e-${index === 0 ? 'start' : form.questions[index - 1].id}-${q.id}`,
        source: index === 0 ? 'start' : form.questions[index - 1].id,
        target: q.id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      });
    });

    // End Node
    const lastId = form.questions.length > 0 ? form.questions[form.questions.length - 1].id : 'start';
    newNodes.push({
      id: 'end',
      type: 'end',
      position: { x: 0, y: 0 },
      data: { label: 'End' },
      draggable: false,
    });
    newEdges.push({
      id: `e-${lastId}-end`,
      source: lastId,
      target: 'end',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [form.questions]);

  // Handle Drag & Drop Reordering
  const onNodeDragStart = () => setIsLayouting(true);
  
  const onNodeDragStop = (event: any, node: Node) => {
    if (node.type !== 'question') {
      setIsLayouting(false);
      return;
    }

    // Sort all question nodes by their new X coordinate
    const questionNodes = nodes.filter((n) => n.type === 'question');
    questionNodes.sort((a, b) => a.position.x - b.position.x);

    // Check if the order changed
    const newOrderIds = questionNodes.map((n) => n.id);
    const oldOrderIds = form.questions.map((q) => q.id);

    const hasChanged = newOrderIds.some((id, index) => id !== oldOrderIds[index]);

    if (hasChanged) {
      const reorderedQuestions = newOrderIds.map(
        (id) => form.questions.find((q) => q.id === id)!
      );
      onUpdate({ ...form, questions: reorderedQuestions });
    }
    
    // Unset layouting to allow the useEffect to re-layout with new data
    setIsLayouting(false);
  };

  return (
    <div className="w-full h-full" style={{ backgroundColor: 'var(--bg)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        colorMode={isDark ? "dark" : "light"}
      >
        <Background color="var(--border)" gap={16} />
        <Controls style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', fill: 'var(--text)' }} className="react-flow-controls-custom" />
        <MiniMap 
          zoomable 
          pannable 
          maskColor={isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)'}
          nodeClassName={(n) => {
            if (n.type === 'start') return 'bg-blue-500';
            if (n.type === 'end') return 'bg-green-500';
            return 'bg-gray-400';
          }} 
          style={{ backgroundColor: 'var(--card)' }} 
        />
        <Panel position="top-left" className="px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm" style={{ backgroundColor: 'var(--card)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
          Drag questions horizontally to reorder them
        </Panel>
      </ReactFlow>
    </div>
  );
}
