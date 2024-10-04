"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Instagram, Twitter, Linkedin, Facebook, Youtube,
  Zap, Laugh, Lightbulb, AlertCircle, Coffee, Briefcase, MessageSquare, Heart,
  Users, UserPlus, UserCheck, User,
  Settings, BookmarkIcon, RefreshCw, Copy, Trash2, X,
  Baby, Glasses, GraduationCap, Bike
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HistoryDialog } from "@/components/ui/HistoryDialog"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

export default function CaptionGeneratorComponent() {
  const [contentDescription, setContentDescription] = useState("")
  const [tone, setTone] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [platform, setPlatform] = useState("")
  const [generateHashtags, setGenerateHashtags] = useState(false)
  const [generatedCaption, setGeneratedCaption] = useState("")
  const [savedCaptions, setSavedCaptions] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activePopup, setActivePopup] = useState<{ action: string } | null>(null);
  const [captionHistory, setCaptionHistory] = useState<string[]>([])
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isFormComplete = () => {
    return contentDescription && tone && targetAudience && platform
  }

  const generateCaption = async () => {
    if (isFormComplete()) {
      setIsLoading(true)
      try {
        const hashtagInstruction = generateHashtags
          ? 'Include 2 relevant hashtags at the end of the caption.'
          : 'Do not include any hashtags in the caption.'

        const prompt = `Generate a ${tone} caption for ${platform} targeting ${targetAudience}. 
        The image description is: "${contentDescription}".
        Remember, it's not always necessary to include everything from the description.
        Focus on creating an engaging caption that matches the tone and appeals to the target audience.
        ${hashtagInstruction}
        The caption should be concise, ideally within 1-2 sentences${generateHashtags ? ', followed by hashtags' : ''}.`

        const response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "mixtral-8x7b-32768",
            messages: [
              {
                role: "system",
                content: `You are a skilled social media manager, expert in creating engaging captions for various platforms. Your task is to generate captions based on image descriptions, considering the specified tone, target audience, and platform. You should not always include everything from the description, but rather focus on creating an appealing caption that fits the given parameters. ${hashtagInstruction}`
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 150,
            top_p: 1,
            stream: false
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const newCaption = data.choices[0]?.message?.content?.trim() || "";
        setGeneratedCaption(newCaption)
        setCaptionHistory(prevHistory => [newCaption, ...prevHistory])
      } catch (error) {
        console.error('Error generating caption:', error)
        if (error instanceof Error) {
          setGeneratedCaption(`Error: ${error.message}`)
        } else {
          setGeneratedCaption("An unknown error occurred. Please try again.")
        }
      } finally {
        setIsLoading(false)
      }
    }
  }

  const saveCaption = () => {
    if (generatedCaption && !savedCaptions.includes(generatedCaption)) {
      setSavedCaptions(prevCaptions => [...prevCaptions, generatedCaption])
    }
  }

  const deleteCaption = (index: number) => {
    setSavedCaptions(prevCaptions => prevCaptions.filter((_, i) => i !== index))
  }

  const copyCaption = (caption: string) => {
    navigator.clipboard.writeText(caption)
  }

  const closeDialog = () => setIsDialogOpen(false)

  const handleAction = (action: string, callback: () => void) => {
    setActivePopup({ action });
    callback();
    setTimeout(() => setActivePopup(null), 1000); // Reset after 1 second
  };

  const deleteHistoryCaption = (index: number) => {
    setCaptionHistory(prevHistory => prevHistory.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200">
      <header className="bg-purple-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Caption Wizard</h1>
          <nav className="flex space-x-4">
            <HistoryDialog
              isOpen={isHistoryDialogOpen}
              onOpenChange={setIsHistoryDialogOpen}
              captionHistory={captionHistory}
              onCopy={copyCaption}
              onDelete={deleteHistoryCaption}
            />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="hover:bg-purple-700" onClick={() => setIsDialogOpen(true)}>
                  <BookmarkIcon className="mr-2 h-4 w-4" />
                  Saved
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Saved Captions</DialogTitle>
                  <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={closeDialog}>
                    <X className="h-4 w-4" />
                  </Button>
                </DialogHeader>
                <div className="mt-4 space-y-4 overflow-y-auto flex-grow">
                  {savedCaptions.length > 0 ? (
                    savedCaptions.map((caption, index) => (
                      <div key={index} className="bg-purple-50 p-4 rounded-lg relative">
                        <p className="text-purple-900 mb-2">{caption}</p>
                        <div className="flex justify-end space-x-2">
                          <div className="relative">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleAction('Copied!', () => copyCaption(caption))}
                              className="text-purple-600 border-purple-300 hover:bg-purple-100"
                            >
                              <Copy className="h-4 w-4 mr-1" /> Copy
                            </Button>
                            {activePopup?.action === 'Copied!' && (
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs animate-fade-up">
                                Copied!
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleAction('Deleted!', () => deleteCaption(index))}
                              className="text-red-600 border-red-300 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                            {activePopup?.action === 'Deleted!' && (
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs animate-fade-up">
                                Deleted!
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-purple-600">No saved captions yet.</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" className="hover:bg-purple-700">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto mt-12 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <form onSubmit={(e) => { e.preventDefault(); generateCaption(); }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description" className="text-purple-700 font-semibold">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your image..."
                    value={contentDescription}
                    onChange={(e) => setContentDescription(e.target.value)}
                    className="bg-purple-50 border-purple-200"
                  />
                </div>
                <div>
                  <Label htmlFor="tone" className="text-purple-700 font-semibold">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="tone" className="bg-purple-50 border-purple-200">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="witty">
                        <div className="flex items-center">
                          <Zap className="mr-2 h-4 w-4" />
                          Witty
                        </div>
                      </SelectItem>
                      <SelectItem value="funny">
                        <div className="flex items-center">
                          <Laugh className="mr-2 h-4 w-4" />
                          Funny
                        </div>
                      </SelectItem>
                      <SelectItem value="inspirational">
                        <div className="flex items-center">
                          <Lightbulb className="mr-2 h-4 w-4" />
                          Inspirational
                        </div>
                      </SelectItem>
                      <SelectItem value="serious">
                        <div className="flex items-center">
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Serious
                        </div>
                      </SelectItem>
                      <SelectItem value="casual">
                        <div className="flex items-center">
                          <Coffee className="mr-2 h-4 w-4" />
                          Casual
                        </div>
                      </SelectItem>
                      <SelectItem value="professional">
                        <div className="flex items-center">
                          <Briefcase className="mr-2 h-4 w-4" />
                          Professional
                        </div>
                      </SelectItem>
                      <SelectItem value="sarcastic">
                        <div className="flex items-center">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Sarcastic
                        </div>
                      </SelectItem>
                      <SelectItem value="emotional">
                        <div className="flex items-center">
                          <Heart className="mr-2 h-4 w-4" />
                          Emotional
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="target-audience" className="text-purple-700 font-semibold">Target Audience</Label>
                  <Select value={targetAudience} onValueChange={setTargetAudience}>
                    <SelectTrigger id="target-audience" className="bg-purple-50 border-purple-200">
                      <SelectValue placeholder="Select target audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          General Audience
                        </div>
                      </SelectItem>
                      <SelectItem value="teenagers">
                        <div className="flex items-center">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Teenagers (13-19)
                        </div>
                      </SelectItem>
                      <SelectItem value="young-adults">
                        <div className="flex items-center">
                          <GraduationCap className="mr-2 h-4 w-4" />
                          Young Adults (20-29)
                        </div>
                      </SelectItem>
                      <SelectItem value="parents">
                        <div className="flex items-center">
                          <Baby className="mr-2 h-4 w-4" />
                          Parents
                        </div>
                      </SelectItem>
                      <SelectItem value="professionals">
                        <div className="flex items-center">
                          <Briefcase className="mr-2 h-4 w-4" />
                          Professionals (30-50)
                        </div>
                      </SelectItem>
                      <SelectItem value="seniors">
                        <div className="flex items-center">
                          <Glasses className="mr-2 h-4 w-4" />
                          Seniors (60+)
                        </div>
                      </SelectItem>
                      <SelectItem value="fitness-enthusiasts">
                        <div className="flex items-center">
                          <Bike className="mr-2 h-4 w-4" />
                          Fitness Enthusiasts
                        </div>
                      </SelectItem>
                      <SelectItem value="couples">
                        <div className="flex items-center">
                          <Heart className="mr-2 h-4 w-4" />
                          Couples
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="platform" className="text-purple-700 font-semibold">Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger id="platform" className="bg-purple-50 border-purple-200">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">
                        <div className="flex items-center">
                          <Instagram className="mr-2 h-4 w-4" />
                          Instagram
                        </div>
                      </SelectItem>
                      <SelectItem value="twitter">
                        <div className="flex items-center">
                          <Twitter className="mr-2 h-4 w-4" />
                          Twitter
                        </div>
                      </SelectItem>
                      <SelectItem value="linkedin">
                        <div className="flex items-center">
                          <Linkedin className="mr-2 h-4 w-4" />
                          LinkedIn
                        </div>
                      </SelectItem>
                      <SelectItem value="facebook">
                        <div className="flex items-center">
                          <Facebook className="mr-2 h-4 w-4" />
                          Facebook
                        </div>
                      </SelectItem>
                      <SelectItem value="youtube">
                        <div className="flex items-center">
                          <Youtube className="mr-2 h-4 w-4" />
                          YouTube
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="generateHashtags"
                    checked={generateHashtags}
                    onCheckedChange={(checked) => setGenerateHashtags(checked as boolean)}
                  />
                  <Label htmlFor="generateHashtags">Generate Hashtags</Label>
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white transition duration-300 ease-in-out transform hover:scale-105" 
                  disabled={!isFormComplete() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate Caption
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {generatedCaption && (
          <Card className="max-w-2xl mx-auto mt-8 bg-white shadow-xl rounded-xl overflow-hidden">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-purple-800">Generated Caption</h3>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-purple-900">{generatedCaption}</p>
              </div>
              <div className="flex justify-end space-x-2 mt-2">
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAction('Copied!', () => copyCaption(generatedCaption))}
                    className="text-purple-600 border-purple-300 hover:bg-purple-100"
                  >
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </Button>
                  {activePopup?.action === 'Copied!' && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs animate-fade-up">
                      Copied!
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAction('Saved!', saveCaption)}
                    className="text-purple-600 border-purple-300 hover:bg-purple-100"
                  >
                    <BookmarkIcon className="h-4 w-4 mr-1" /> Save
                  </Button>
                  {activePopup?.action === 'Saved!' && (
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs animate-fade-up">
                      {savedCaptions.includes(generatedCaption) ? 'Saved!' : 'Saved!'}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}