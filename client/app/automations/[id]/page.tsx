'use client';

import WorkflowBuilder from '../../../components/WorkflowBuilder';
import { useParams } from 'next/navigation';

export default function WorkflowEditorPage() {
    const params = useParams();
    const id = params?.id as string;

    return (
        <main className="w-full h-full flex flex-col bg-black">
            <div className="bg-black border-b border-gray-800 p-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-white">Visual Workflow Builder</h1>
                    <p className="text-gray-400 text-xs font-mono">ID: {id}</p>
                </div>
            </div>
            <WorkflowBuilder workflowId={id} />
        </main>
    );
}
