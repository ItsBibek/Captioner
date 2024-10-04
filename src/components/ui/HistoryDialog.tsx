import React from 'react'
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { History, X, Copy, Trash2 } from "lucide-react"

interface HistoryDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  captionHistory: string[]
  onCopy: (caption: string) => void
  onDelete: (index: number) => void
}

export function HistoryDialog({ isOpen, onOpenChange, captionHistory, onCopy, onDelete }: HistoryDialogProps) {
  const [activePopup, setActivePopup] = React.useState<{ index: number, action: string } | null>(null)

  const handleAction = (index: number, action: string, callback: () => void) => {
    setActivePopup({ index, action })
    callback()
    setTimeout(() => setActivePopup(null), 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="hover:bg-purple-700">
          <History className="mr-2 h-4 w-4" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Caption History</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="mt-4 space-y-4 overflow-y-auto flex-grow">
          {captionHistory.length > 0 ? (
            captionHistory.map((caption, index) => (
              <div key={index} className="bg-purple-50 p-4 rounded-lg relative">
                <p className="text-purple-900 mb-2">{caption}</p>
                <div className="flex justify-end space-x-2">
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAction(index, 'Copied!', () => onCopy(caption))}
                      className="text-purple-600 border-purple-300 hover:bg-purple-100"
                    >
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </Button>
                    {activePopup?.index === index && activePopup?.action === 'Copied!' && (
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs animate-fade-up">
                        Copied!
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAction(index, 'Deleted!', () => onDelete(index))}
                      className="text-red-600 border-red-300 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                    {activePopup?.index === index && activePopup?.action === 'Deleted!' && (
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs animate-fade-up">
                        Deleted!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-purple-600">No caption history yet.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
