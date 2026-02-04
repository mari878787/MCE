import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

// Common style for all nodes to ensure consistency
const nodeStyle = "px-4 py-2 shadow-sm rounded-xl border bg-card min-w-[150px] transition-all hover:shadow-md";

export const TriggerNode = memo(({ data }: any) => {
    return (
        <div className={`${nodeStyle} border-blue-200 hover:border-blue-400`}>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500 ring-2 ring-white" />
            <div className="font-bold text-blue-600 text-sm flex items-center gap-2">
                <span className="text-lg">⚡</span> TRIGGER
            </div>
            <div className="text-xs text-muted-foreground mt-1 font-medium">
                {data.triggerType === 'tag_added'
                    ? `Tag: ${data.triggerValue || '?'}`
                    : (data.label || 'Start')}
            </div>
        </div>
    );
});

export const MessageNode = memo(({ data }: any) => {
    return (
        <div className={`${nodeStyle} border-green-200 hover:border-green-400`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-muted-foreground/30 ring-2 ring-white" />
            <div className="font-bold text-green-600 text-sm flex items-center gap-2">
                <span className="text-lg">💬</span> MESSAGE
            </div>
            <div className="text-xs text-muted-foreground mt-1 truncate font-medium">{data.content || 'Select template'}</div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500 ring-2 ring-white" />
        </div>
    );
});

export const DelayNode = memo(({ data }: any) => {
    return (
        <div className={`${nodeStyle} border-yellow-200 hover:border-yellow-400`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-muted-foreground/30 ring-2 ring-white" />
            <div className="font-bold text-yellow-600 text-sm flex items-center gap-2">
                <span className="text-lg">⏳</span> DELAY
            </div>
            <div className="text-xs text-muted-foreground mt-1 font-medium">{data.wait_time ? `${data.wait_time} hours` : 'Set duration'}</div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-yellow-500 ring-2 ring-white" />
        </div>
    );
});

export const ConditionNode = memo(({ data }: any) => {
    return (
        <div className={`${nodeStyle} border-purple-200 hover:border-purple-400`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-muted-foreground/30 ring-2 ring-white" />
            <div className="font-bold text-purple-600 text-sm flex items-center gap-2">
                <span className="text-lg">❓</span> CONDITION
            </div>
            <div className="text-xs text-muted-foreground mt-1 font-medium">
                {data.conditionType ? `${data.conditionType === 'tag' ? 'Tag:' : 'Status:'} ${data.conditionValue || '?'}` : (data.condition || 'Check')}
            </div>

            {/* Two outputs for Yes/No branching */}
            <div className="flex justify-between mt-2 pt-2 border-t border-dashed border-border">
                <div className="relative">
                    <span className="text-[10px] text-green-600 font-bold absolute -bottom-5 left-0">Yes</span>
                    <Handle type="source" position={Position.Bottom} id="yes" className="w-3 h-3 bg-green-500 !left-2 ring-2 ring-white" />
                </div>
                <div className="relative">
                    <span className="text-[10px] text-red-500 font-bold absolute -bottom-5 right-0">No</span>
                    <Handle type="source" position={Position.Bottom} id="no" className="w-3 h-3 bg-red-500 !left-auto !right-2 ring-2 ring-white" />
                </div>
            </div>
        </div>
    );
});
