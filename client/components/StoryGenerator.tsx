
// 'use client'
// import React, { useState } from 'react';
// import { Button } from './ui/button';
// import { Input } from './ui/input';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
// import ReactMarkdown from 'react-markdown';
// import { jsPDF } from 'jspdf';

// export function StoryGenerator() {
//   const [prompt, setPrompt] = useState('');
//   const [story, setStory] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   const generateStory = async (userPrompt: string) => {
//     setIsLoading(true);
//     try {
//       const response = await fetch('/api/generate', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ prompt: userPrompt }),
//       });
      
//       const data = await response.json();
//       setStory(data.story);
//     } catch (error) {
//       console.error('Error generating story:', error);
//     } finally {
//       setIsLoading(false);
//       setIsDialogOpen(false);
//     }
//   };

//   const downloadPDF = () => {
//     const doc = new jsPDF();
//     doc.setFont('helvetica');
//     doc.setFontSize(12);
    
//     const splitText = doc.splitTextToSize(story, 180);
//     doc.text(splitText, 15, 20);
//     doc.save('generated-story.pdf');
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
//       <div className="max-w-2xl mx-auto p-8">
//         <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-purple-100 transition-all hover:shadow-2xl">
//           <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Story Generator</h2>
//           <div className="space-y-6">
//             <Input
//               placeholder="What kind of story would you like?"
//               value={prompt}
//               onChange={(e) => setPrompt(e.target.value)}
//               className="transition-all focus:ring-2 focus:ring-purple-400"
//             />
//             <Button 
//               onClick={() => generateStory(prompt)}
//               disabled={isLoading || !prompt}
//               className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300"
//             >
//               {isLoading ? (
//                 <div className="flex items-center justify-center space-x-2">
//                   <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                   <span>Generating...</span>
//                 </div>
//               ) : (
//                 'Generate Story'
//               )}
//             </Button>
//           </div>

//           {story && (
//             <div className="mt-8 animate-fadeIn">
//               <div className="prose max-w-none bg-white/50 rounded-lg p-6 shadow-inner">
//                 <ReactMarkdown>{story}</ReactMarkdown>
//               </div>
//               <div className="mt-6 flex space-x-4 justify-center">
//                 <Button 
//                   onClick={downloadPDF}
//                   className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300"
//                 >
//                   Download PDF
//                 </Button>
//                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                   <DialogTrigger asChild>
//                     <Button 
//                       variant="outline"
//                       className="border-purple-200 hover:border-purple-400 transition-all duration-300"
//                     >
//                       Change Story
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="bg-white/90 backdrop-blur-lg">
//                     <DialogHeader>
//                       <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Modify Your Story</DialogTitle>
//                     </DialogHeader>
//                     <div className="space-y-4">
//                       <Input
//                         placeholder="Enter new story prompt"
//                         value={prompt}
//                         onChange={(e) => setPrompt(e.target.value)}
//                         className="transition-all focus:ring-2 focus:ring-purple-400"
//                       />
//                       <Button 
//                         onClick={() => generateStory(prompt)}
//                         disabled={isLoading || !prompt}
//                         className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300"
//                       >
//                         Regenerate Story
//                       </Button>
//                     </div>
//                   </DialogContent>
//                 </Dialog>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
'use client'
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import axios from 'axios';

export function StoryGenerator() {
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const generateStory = async (userPrompt: string, isModification: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5050/api/stories/generate', {
        prompt: userPrompt,
        existingStory: story,
        isModification
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setStory(response.data.story);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // More detailed error logging
        console.error('Story generation error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        
        // Optional: Set an error state to show user
        // setError('Failed to generate story. Please try again.');
      } else {
        console.error('Unexpected error:', error);
      }
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };
    const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica');
    doc.setFontSize(12);
    
    const splitText = doc.splitTextToSize(story, 180);
    doc.text(splitText, 15, 20);
    doc.save('generated-story.pdf');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-purple-100 transition-all hover:shadow-2xl">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Story Generator</h2>
          <div className="space-y-6">
            <Input
              placeholder="What kind of story would you like?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="transition-all focus:ring-2 focus:ring-purple-400"
            />
            <Button 
              onClick={() => generateStory(prompt)}
              disabled={isLoading || !prompt}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                'Generate Story'
              )}
            </Button>
          </div>

          {story && (
            <div className="mt-8 animate-fadeIn">
              <div className="prose max-w-none bg-white/50 rounded-lg p-6 shadow-inner">
                <ReactMarkdown>{story}</ReactMarkdown>
              </div>
              <div className="mt-6 flex space-x-4 justify-center">
                <Button 
                  onClick={downloadPDF}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300"
                >
                  Download PDF
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="border-purple-200 hover:border-purple-400 transition-all duration-300"
                    >
                      Change Story
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white/90 backdrop-blur-lg">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Modify Your Story</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Enter modification request"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="transition-all focus:ring-2 focus:ring-purple-400"
                      />
                      <Button 
                        onClick={() => generateStory(prompt, true)}
                        disabled={isLoading || !prompt}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300"
                      >
                        Modify Story
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}