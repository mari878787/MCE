'use client';

import WorkflowBuilder from '../../../components/WorkflowBuilder';
import { useParams } from 'next/navigation';

export default function WorkflowEditorPage() {
    const params = useParams();
    const id = params?.id as string;

    return (
        <main className="w-full h-full flex flex-col bg-background">
            <div className="bg-card border-b border-border p-4 flex justify-between items-center shadow-sm z-10">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Visual Workflow Builder</h1>
                    <p className="text-muted-foreground text-xs font-mono">ID: {id}</p>
                </div>
            </div>
            <WorkflowBuilder workflowId={id} />
        </main>
    );
}
