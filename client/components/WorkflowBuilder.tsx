'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
    useReactFlow,
    type Node,
    type Edge,
    type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import WorkflowSidebar from './WorkflowSidebar';
import NodeConfigPanel from './NodeConfigPanel';
import CustomEdge from './CustomEdge';
import { TriggerNode, MessageNode, DelayNode, ConditionNode } from './CustomNodes';

// Define Node Types map outside component to prevent re-creation
const nodeTypes = {
    trigger: TriggerNode,
    message: MessageNode,
    delay: DelayNode,
    condition: ConditionNode,
};

const edgeTypes = {
    custom: CustomEdge,
};

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'trigger',
        data: { label: 'New Lead Created' },
        position: { x: 250, y: 5 },
    },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

export default function WorkflowBuilder({ workflowId }: { workflowId: string }) {
    return (
        <div className="flex h-[calc(100vh-64px)] w-full bg-black">
            <ReactFlowProvider>
                <WorkflowSidebar />
                <WorkflowCanvas workflowId={workflowId} />
            </ReactFlowProvider>
        </div>
    );
}

function WorkflowCanvas({ workflowId }: { workflowId: string }) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const { screenToFlowPosition, setViewport } = useReactFlow();

    // LOAD WORKFLOW ON MOUNT
    useEffect(() => {
        if (!workflowId) return;

        console.log('Fetching workflow:', workflowId);
        fetch(`http://localhost:5000/api/workflows/${workflowId}`)
            .then(res => {
                if (!res.ok) throw new Error('Not found');
                return res.json();
            })
            .then(data => {
                console.log('Loaded workflow:', data);
                if (data.nodes && data.nodes.length > 0) {
                    setNodes(data.nodes);
                    setEdges(data.edges);
                    // Optional: Fit view after loading
                    setTimeout(() => setViewport({ x: 0, y: 0, zoom: 1 }), 100);
                } else {
                    // Initialize with default if empty/new
                    setNodes(initialNodes);
                }
            })
            .catch(err => {
                console.log('New workflow or error:', err);
                setNodes(initialNodes);
            });
    }, [workflowId, setNodes, setEdges, setViewport]);


    // Update node data when config panel changes
    const onNodeDataChange = (id: string, newData: any) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return { ...node, data: newData };
            }
            return node;
        }));

        // Keep selected node in sync
        if (selectedNode && selectedNode.id === id) {
            setSelectedNode((prev) => prev ? ({ ...prev, data: newData } as Node) : null);
        }
    };

    const onNodeClick = (_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    };

    const onPaneClick = () => {
        setSelectedNode(null);
    };

    const onNodesDelete = useCallback(
        (deleted: Node[]) => {
            setEdges((eds) =>
                eds.filter((edge) => !deleted.some((node) => node.id === edge.source || node.id === edge.target))
            );

            // Clear selection if deleted
            if (deleted.some((node) => node.id === selectedNode?.id)) {
                setSelectedNode(null);
            }
        },
        [selectedNode, setEdges]
    );

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            console.log('Drop type:', type);
            if (!type) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });
            console.log('Drop Position (Screen):', event.clientX, event.clientY);
            console.log('Drop Position (Flow):', position);

            const newNode = {
                id: getId(),
                type,
                position,
                data: { label: `${type} node` },
            } as Node;

            setNodes((nds) => nds.concat(newNode));
            setSelectedNode(newNode); // Auto-select new node
        },
        [screenToFlowPosition, setNodes],
    );

    const handleSave = async () => {
        const workflowData = {
            id: workflowId, // IMPORTANT: Send ID to update existing
            name: "Workflow " + workflowId.substring(0, 8), // Simple name logic for now
            nodes,
            edges
        };

        try {
            const res = await fetch('http://localhost:5000/api/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(workflowData)
            });
            const json = await res.json();
            if (json.success) {
                alert('Workflow Saved!');
            } else {
                alert('Save Failed: ' + json.error);
            }
        } catch (e) {
            console.error(e);
            alert('Network Error Saving Workflow');
        }
    }

    const onNodeDeleteId = (id: string) => {
        setNodes((nds) => nds.filter((n) => n.id !== id));
        setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
        setSelectedNode(null);
    };

    return (
        <div className="flex-1 h-full w-full relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-lg text-sm font-medium transition"
                >
                    Save Workflow
                </button>
            </div>

            {/* CONFIG PANEL */}
            <NodeConfigPanel
                selectedNode={selectedNode}
                onChange={onNodeDataChange}
                onDelete={onNodeDeleteId}
                onClose={() => setSelectedNode(null)}
            />

            <div className="flex h-full w-full" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    onNodesDelete={onNodesDelete}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    defaultEdgeOptions={{ type: 'custom', animated: true }}
                    fitView
                    className="bg-gray-900"
                >
                    <Controls className="bg-white text-black" />
                    <MiniMap className="bg-gray-800" />
                    <Background gap={12} size={1} />
                </ReactFlow>
            </div>
        </div>
    );
}
