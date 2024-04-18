"use client"
import React, { useState } from 'react';
import { MDXEditor, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin } from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { ForwardRefEditor } from '@/utils/EditorSetup/ForwardRefEditor';
import Markdown from 'react-markdown'
import marked from 'marked';

// const markdown = `
// Hello **world**!
// `


const DescriptionComponent = () => {
    const [markdown, setMarkdown] = useState(`
        Hello **world**!
    `);

    // Function to handle change in Markdown content
    const handleMarkdownChange = async (newMarkdown: React.SetStateAction<string>) => {
        await setMarkdown(newMarkdown);
        console.log(newMarkdown); // Logging the updated Markdown content
    };

    console.log(markdown);

    const postData = async () => {
        try {
            const markdownData = markdown

            const response = await fetch('http://localhost:5000/markdown', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: markdownData })
            });

            if (!response.ok) {
                throw new Error('Failed to save Markdown data');
            }

            const data = await response.json();
            console.log(data); // Response from the server
        } catch (error) {
            console.error('Error posting Markdown data:', error);
        }
    };

    return (
        <div>
            <div className='no-tailwind'>

                <h1 className=''>This is demo Description</h1>
            </div>
            <div className='border max-w-[1000px] mx-auto '>

                <ForwardRefEditor
                    markdown={markdown}
                    onChange={handleMarkdownChange}
                >
                </ForwardRefEditor>
            </div>
            <div className='border max-w-[1000px] mx-auto no-tailwind'>
                <Markdown>{markdown}</Markdown>
            </div>
            <div className='border max-w-[1000px] mx-auto no-tailwind mt-8'>
                <button
                    className=''
                    onClick={postData}
                >
                    Submit
                </button>
            </div>
        </div >
    );
};

export default DescriptionComponent;