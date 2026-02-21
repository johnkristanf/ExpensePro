'use client'

import PageTitle from '@/components/page-title'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useUser } from '@/hooks/use-user'
import { sendMessage } from '@/lib/api/autopilot/post'
import { useMutation } from '@tanstack/react-query'
import { Bot, Send, User } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PromptDrawer } from '@/components/prompt-drawer'
import { Markdown } from '@/components/markdown'

interface Message {
    id: number
    text: string
    sender: 'user' | 'bot'
    timestamp: Date
}

const EXAMPLE_PROMPTS = [
    "Today I spent 20 pesos for Morning Bread using Discretionary Budget",
    "Today I spent 50 pesos for bus fare to Tagum - 15 pesos for pedicab fare to Terminal using Transportation Budget",
]

export default function AutopilotPage() {
    const { data: user } = useUser()
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')

    const mutation = useMutation({
        mutationFn: async (message: string) => {
            if (!user?.id) throw new Error("User not found")
            return await sendMessage(user.id, message)
        },
        onSuccess: (data) => {
            console.log("data: ", data);

            // data.data is the string response from the bot based on the python code
            const botResponse: Message = {
                id: messages.length + 2,
                text: data.message,
                sender: 'bot',
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, botResponse])
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to process message")
            const errorResponse: Message = {
                id: messages.length + 2,
                text: "Sorry, I encountered an error processing your request.",
                sender: 'bot',
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, errorResponse])
        }
    })

    const handleSendMessage = () => {
        if (!inputValue.trim()) return

        const newMessage: Message = {
            id: messages.length + 1,
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, newMessage])
        setInputValue('')

        mutation.mutate(newMessage.text)
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleSelectPrompt = (text: string) => {
        setInputValue((prev) => {
            const trimmed = prev.trim()
            if (!trimmed) return `- ${text}`
            return `${trimmed}\n- ${text}`
        })
        toast.success("Prompt added")
    }

    return (
        <div className="container mx-auto py-5 h-[calc(100vh-2rem)] flex flex-col">
            <div className="flex items-center justify-between">
                <PageTitle title="Autopilot" />
                <PromptDrawer onSelectPrompt={handleSelectPrompt} />
            </div>

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
                                            onClick={() => {
                                                const formatted = prompt.split(' - ').map(p => `- ${p.trim()}`).join('\n')
                                                setInputValue(formatted)
                                            }}
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
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                                        }`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-lg px-4 py-2 ${message.sender === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                            }`}
                                    >
                                        <Markdown content={message.text} />
                                        <p className="text-xs opacity-70 mt-1">
                                            {message.timestamp.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {mutation.isPending && (
                                <div className="flex justify-start">
                                    <div className="bg-muted max-w-[70%] rounded-lg px-4 py-2">
                                        <div className="flex gap-1 items-center">
                                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="border-t p-4 bg-background">
                    <div className="flex gap-2">
                        <Textarea
                            placeholder="Describe your expense (e.g., 'Spent $50 on groceries at Walmart')"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="flex-1 min-h-[50px] max-h-[200px]"
                            disabled={mutation.isPending}
                        />
                        <Button
                            onClick={handleSendMessage}
                            size="icon"
                            className="cursor-pointer"
                            disabled={!inputValue.trim() || mutation.isPending}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
