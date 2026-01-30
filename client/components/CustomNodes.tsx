import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

// Common style for all nodes to ensure consistency
const nodeStyle = "px-4 py-2 shadow-md rounded-md border-2 bg-white min-w-[150px]";

export const TriggerNode = memo(({ data }: any) => {
    return (
        <div className={`${nodeStyle} border-blue-500`}>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
            <div className="font-bold text-blue-800 text-sm">⚡ TRIGGER</div>
            <div className="text-xs text-gray-600 mt-1">
                {data.triggerType === 'tag_added'
                    ? `Tag: ${data.triggerValue || '?'}`
                    : (data.label || 'Start')}
            </div>
        </div>
    );
});

export const MessageNode = memo(({ data }: any) => {
    return (
        <div className={`${nodeStyle} border-green-500`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />
            <div className="font-bold text-green-700 text-sm">💬 MESSAGE</div>
            <div className="text-xs text-gray-600 mt-1 truncate">{data.content || 'Select template'}</div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500" />
        </div>
    );
});

export const DelayNode = memo(({ data }: any) => {
    return (
        <div className={`${nodeStyle} border-yellow-500`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />
            <div className="font-bold text-yellow-700 text-sm">⏳ DELAY</div>
            <div className="text-xs text-gray-600 mt-1">{data.wait_time ? `${data.wait_time} hours` : 'Set duration'}</div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-yellow-500" />
        </div>
    );
});

export const ConditionNode = memo(({ data }: any) => {
    return (
        <div className={`${nodeStyle} border-purple-500`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />
            <div className="font-bold text-purple-700 text-sm">❓ CONDITION</div>
            <div className="text-xs text-gray-600 mt-1">
                {data.conditionType ? `${data.conditionType === 'tag' ? 'Tag:' : 'Status:'} ${data.conditionValue || '?'}` : (data.condition || 'Check')}
            </div>

            {/* Two outputs for Yes/No branching */}
            <div className="flex justify-between mt-2">
                <div className="relative">
                    <span className="text-[10px] text-green-600 absolute -bottom-4 left-0">Yes</span>
                    <Handle type="source" position={Position.Bottom} id="yes" className="w-3 h-3 bg-green-500 !left-2" />
                </div>
                <div className="relative">
                    <span className="text-[10px] text-red-600 absolute -bottom-4 right-0">No</span>
                    <Handle type="source" position={Position.Bottom} id="no" className="w-3 h-3 bg-red-500 !left-auto !right-2" />
                </div>
            </div>
        </div>
    );
});
