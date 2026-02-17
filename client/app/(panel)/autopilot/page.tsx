'use client'

import PageTitle from '@/components/page-title'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, Send } from 'lucide-react'
import { useState } from 'react'

interface Message {
    id: number
    text: string
    sender: 'user' | 'bot'
    timestamp: Date
}

const EXAMPLE_PROMPTS = [
    "Spent $50 on groceries at Walmart",
    "Paid $25 for lunch at McDonald's",
    "Today I spent $30 on coffee at Starbucks, $45 on dinner at Olive Garden, and $20 on gas at Shell"
]

export default function AutopilotPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')

    const handleSendMessage = () => {
        if (!inputValue.trim()) return

        const newMessage: Message = {
            id: messages.length + 1,
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
        }

        setMessages([...messages, newMessage])
        setInputValue('')

        // Simulate bot response
        setTimeout(() => {
            const botResponse: Message = {
                id: messages.length + 2,
                text: "I'm processing your expense request. This feature is coming soon!",
                sender: 'bot',
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, botResponse])
        }, 1000)
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage()
        }
    }

    return (
        <div className="container mx-auto py-5 h-[calc(100vh-2rem)] flex flex-col">
            <PageTitle title="Autopilot" />

            <div className="mb-4">
                <p className="text-muted-foreground">
                    Describe your expense in natural language to record it automatically with AI.
                </p>    
            </div>

            {/* Chat Container */}
            <div className="flex-1 flex flex-col border rounded-lg overflow-hidden bg-card">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4">
                    {messages.length === 0 ? (
                        // Centered Welcome State (like ChatGPT)
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bot className="h-8 w-8 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-semibold">Welcome to Autopilot</h2>
                                <p className="text-muted-foreground max-w-md">
                                    Describe your expense in natural language and I'll help you record it automatically.
                                    <span className="font-semibold text-primary"> You can even record multiple expenses at once!</span>
                                </p>
                            </div>

                            {/* Prompt Examples */}
                            <div className="flex flex-col items-center gap-2 w-full max-w-3xl mt-3">
                                <p className="text-sm text-muted-foreground mb-1">Try these examples:</p>
                                <div className="flex flex-row gap-2 flex-wrap justify-center">
                                    {EXAMPLE_PROMPTS.map((prompt, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setInputValue(prompt)}
                                            className="text-left px-4 py-3 rounded-lg border bg-background hover:bg-muted transition-colors cursor-pointer"
                                        >
                                            <p className="text-sm">{prompt}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Messages List
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                                        }`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-lg px-4 py-2 ${message.sender === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                            }`}
                                    >
                                        <p className="text-sm">{message.text}</p>
                                        <p className="text-xs opacity-70 mt-1">
                                            {message.timestamp.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="border-t p-4 bg-background">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Describe your expense (e.g., 'Spent $50 on groceries at Walmart')"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1"
                        />
                        <Button onClick={handleSendMessage} size="icon" className="cursor-pointer">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
