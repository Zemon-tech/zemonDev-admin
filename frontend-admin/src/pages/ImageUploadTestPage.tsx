import React, { useState } from 'react';
import { ImageUploadField } from '../components/common/ImageUploadField';

const ImageUploadTestPage: React.FC = () => {
    const [formData, setFormData] = useState({
        title: 'Test Problem',
        description: 'Test Description',
        thumbnailUrl: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Test form submitted with data:', formData);
        console.log('Thumbnail URL specifically:', formData.thumbnailUrl);
        
        // Simulate sending to backend
        const cleanedFormData = {
            ...formData,
            thumbnailUrl: formData.thumbnailUrl && formData.thumbnailUrl.trim() !== '' ? formData.thumbnailUrl : undefined
        };
        
        console.log('Cleaned form data:', cleanedFormData);
        alert(`Form data ready to send:\n${JSON.stringify(cleanedFormData, null, 2)}`);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Image Upload Test Page</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Title</span>
                    </label>
                    <input 
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="input input-bordered w-full"
                    />
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Description</span>
                    </label>
                    <textarea 
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="textarea textarea-bordered w-full"
                        rows={3}
                    />
                </div>

                <div className="form-control">
                    <ImageUploadField
                        value={formData.thumbnailUrl || ''}
                        onChange={(url) => {
                            console.log('ImageUploadField onChange called with URL:', url);
                            setFormData(prev => {
                                const newData = { ...prev, thumbnailUrl: url };
                                console.log('Updated formData:', newData);
                                return newData;
                            });
                        }}
                        label="Thumbnail Image"
                        placeholder="https://..."
                        uploadType='crucible-thumbnail'
                        maxSizeKB={500}
                        acceptedFormats={['jpg', 'jpeg', 'png', 'gif', 'webp']}
                    />
                </div>

                <div className="form-control">
                    <button type="submit" className="btn btn-primary">
                        Test Submit
                    </button>
                </div>
            </form>

            <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4">Current Form State</h2>
                <pre className="bg-base-200 p-4 rounded-lg overflow-auto">
                    {JSON.stringify(formData, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default ImageUploadTestPage;
