
import React from 'react';

export default function WorkflowSidebar() {
    const onDragStart = (event: React.DragEvent, nodeType: string, payload?: any) => {
        console.log('Drag Start:', nodeType);
        event.dataTransfer.setData('application/reactflow', nodeType);
        if (payload) event.dataTransfer.setData('payload', JSON.stringify(payload));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col gap-4 h-full">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Workflow Tools</h2>

            <div
                className="bg-blue-900/40 border border-blue-500/50 p-3 rounded cursor-pointer hover:bg-blue-800/50 transition"
                onDragStart={(event) => onDragStart(event, 'trigger')}
                draggable
            >
                <div className="font-bold text-blue-400 text-sm">⚡ Trigger</div>
                <div className="text-xs text-gray-500">Starts the flow (e.g. Inbound Msg)</div>
            </div>

            <div
                className="bg-green-900/40 border border-green-500/50 p-3 rounded cursor-pointer hover:bg-green-800/50 transition"
                onDragStart={(event) => onDragStart(event, 'message')}
                draggable
            >
                <div className="font-bold text-green-400 text-sm">💬 Send Message</div>
                <div className="text-xs text-gray-500">WhatsApp text or template</div>
            </div>

            <div
                className="bg-yellow-900/40 border border-yellow-500/50 p-3 rounded cursor-pointer hover:bg-yellow-800/50 transition"
                onDragStart={(event) => onDragStart(event, 'delay')}
                draggable
            >
                <div className="font-bold text-yellow-400 text-sm">⏳ Delay</div>
                <div className="text-xs text-gray-500">Wait for X hours/days</div>
            </div>

            <div
                className="bg-purple-900/40 border border-purple-500/50 p-3 rounded cursor-pointer hover:bg-purple-800/50 transition"
                onDragStart={(event) => onDragStart(event, 'condition')}
                draggable
            >
                <div className="font-bold text-purple-400 text-sm">❓ Condition</div>
                <div className="text-xs text-gray-500">Check for Tag / Status</div>
            </div>

            <div className="mt-auto border-t border-gray-800 pt-4 text-xs text-gray-600">
                Drag items onto the canvas to add them. Double click nodes to edit.
            </div>
        </aside>
    );
}
