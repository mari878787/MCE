import React, { useEffect, useState } from 'react';
import { type Node } from '@xyflow/react';

type NodeConfigPanelProps = {
    selectedNode: Node | null;
    onChange: (id: string, data: any) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
};

export default function NodeConfigPanel({ selectedNode, onChange, onDelete, onClose }: NodeConfigPanelProps) {
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (selectedNode) {
            setFormData(selectedNode.data);
        }
    }, [selectedNode]);

    const handleChange = (key: string, value: any) => {
        const newData = { ...formData, [key]: value };
        setFormData(newData);
        if (selectedNode) {
            onChange(selectedNode.id, newData);
        }
    };

    if (!selectedNode) return null;

    return (
        <aside className="w-80 bg-card border-l border-border p-4 flex flex-col h-full absolute right-0 top-0 z-20 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-border pb-2">
                <h2 className="font-bold text-foreground uppercase tracking-wider text-sm">
                    Edit {selectedNode.type}
                </h2>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <div className="flex flex-col gap-4">
                {/* TRIGGER NODE CONFIG */}
                {selectedNode.type === 'trigger' && (
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">Trigger Type</label>
                            <select
                                value={formData.triggerType || 'manual'}
                                onChange={(e) => handleChange('triggerType', e.target.value)}
                                className="bg-secondary text-foreground border border-border rounded px-2 py-1 text-sm focus:border-primary outline-none transition"
                            >
                                <option value="manual">Manual / Default</option>
                                <option value="tag_added">Tag Added</option>
                            </select>
                        </div>
                        {formData.triggerType === 'tag_added' && (
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground">Tag Name</label>
                                <input
                                    type="text"
                                    value={formData.triggerValue || ''}
                                    onChange={(e) => handleChange('triggerValue', e.target.value)}
                                    placeholder="e.g. #VIP"
                                    className="bg-secondary text-foreground border border-border rounded px-2 py-1 text-sm focus:border-primary outline-none transition"
                                />
                            </div>
                        )}
                        <div className="border-t border-border my-2"></div>
                    </div>
                )}

                {/* GLOBAL LABEL */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Node Label</label>
                    <input
                        type="text"
                        value={formData.label || ''}
                        onChange={(e) => handleChange('label', e.target.value)}
                        className="bg-secondary text-foreground border border-border rounded px-2 py-1 text-sm focus:border-primary outline-none transition"
                    />
                </div>

                {/* MESSAGE NODE CONFIG */}
                {selectedNode.type === 'message' && (
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">Message Content</label>
                            <textarea
                                value={formData.content || ''}
                                onChange={(e) => handleChange('content', e.target.value)}
                                rows={6}
                                placeholder="Hello {{name}}, welcome to..."
                                className="bg-secondary text-foreground border border-border rounded px-2 py-1 text-sm focus:border-primary outline-none transition"
                            />
                            <span className="text-[10px] text-muted-foreground">Supported variables: {'{{name}}'}, {'{{phone}}'}</span>
                        </div>
                    </div>
                )}

                {/* DELAY NODE CONFIG */}
                {selectedNode.type === 'delay' && (
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">Wait Duration (Hours)</label>
                            <input
                                type="number"
                                value={formData.wait_time || 0}
                                onChange={(e) => handleChange('wait_time', parseInt(e.target.value))}
                                className="bg-secondary text-foreground border border-border rounded px-2 py-1 text-sm focus:border-primary outline-none transition"
                            />
                        </div>
                    </div>
                )}

                {/* CONDITION NODE CONFIG */}
                {selectedNode.type === 'condition' && (
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">Condition Type</label>
                            <select
                                value={formData.conditionType || 'tag'}
                                onChange={(e) => handleChange('conditionType', e.target.value)}
                                className="bg-secondary text-foreground border border-border rounded px-2 py-1 text-sm focus:border-primary outline-none transition"
                            >
                                <option value="tag">Has Tag</option>
                                <option value="status">Status Is</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-muted-foreground">Value to Check</label>
                            <input
                                type="text"
                                value={formData.conditionValue || ''}
                                onChange={(e) => handleChange('conditionValue', e.target.value)}
                                placeholder="e.g. #VIP or INTERESTED"
                                className="bg-secondary text-foreground border border-border rounded px-2 py-1 text-sm focus:border-primary outline-none transition"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-auto pt-4 border-t border-border flex flex-col gap-2">
                <button
                    onClick={() => onDelete(selectedNode.id)}
                    className="w-full bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 py-2 rounded text-xs font-semibold transition"
                >
                    Delete Node
                </button>
                <div className="text-[10px] text-muted-foreground text-center">
                    Node ID: {selectedNode.id}
                </div>
            </div>
        </aside>
    );
}
