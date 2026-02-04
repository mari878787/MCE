
import React from 'react';

export default function WorkflowSidebar() {
    const onDragStart = (event: React.DragEvent, nodeType: string, payload?: any) => {
        console.log('Drag Start:', nodeType);
        event.dataTransfer.setData('application/reactflow', nodeType);
        if (payload) event.dataTransfer.setData('payload', JSON.stringify(payload));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 bg-card border-r border-border p-4 flex flex-col gap-4 h-full">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Workflow Tools</h2>

            <div
                className="bg-blue-500/10 border border-blue-500/20 p-3 rounded cursor-pointer hover:bg-blue-500/20 transition shadow-sm"
                onDragStart={(event) => onDragStart(event, 'trigger')}
                draggable
            >
                <div className="font-bold text-blue-600 text-sm">⚡ Trigger</div>
                <div className="text-xs text-muted-foreground">Starts the flow (e.g. Inbound Msg)</div>
            </div>

            <div
                className="bg-green-500/10 border border-green-500/20 p-3 rounded cursor-pointer hover:bg-green-500/20 transition shadow-sm"
                onDragStart={(event) => onDragStart(event, 'message')}
                draggable
            >
                <div className="font-bold text-green-600 text-sm">💬 Send Message</div>
                <div className="text-xs text-muted-foreground">WhatsApp text or template</div>
            </div>

            <div
                className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded cursor-pointer hover:bg-yellow-500/20 transition shadow-sm"
                onDragStart={(event) => onDragStart(event, 'delay')}
                draggable
            >
                <div className="font-bold text-yellow-600 text-sm">⏳ Delay</div>
                <div className="text-xs text-muted-foreground">Wait for X hours/days</div>
            </div>

            <div
                className="bg-purple-500/10 border border-purple-500/20 p-3 rounded cursor-pointer hover:bg-purple-500/20 transition shadow-sm"
                onDragStart={(event) => onDragStart(event, 'condition')}
                draggable
            >
                <div className="font-bold text-purple-600 text-sm">❓ Condition</div>
                <div className="text-xs text-muted-foreground">Check for Tag / Status</div>
            </div>

            <div className="mt-auto border-t border-border pt-4 text-xs text-muted-foreground">
                Drag items onto the canvas to add them. Double click nodes to edit.
            </div>
        </aside>
    );
}
