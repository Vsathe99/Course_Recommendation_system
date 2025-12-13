import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// mockApiResponse.js
export const recommendationResponse = {
  success: true,
  query: {
    topic: "Machine Learning",
    subtopic: "Neural Networks",
    extraInfo: "Beginner friendly resources"
  },
  results: [
    {
      id: "res_1",
      title: "Neural Networks from Scratch",
      source: "YouTube",
      sourceUrl: "https://youtube.com/example",
      rating: 4.6,
      description:
        "A beginner-friendly YouTube course explaining neural networks with visual intuition and code examples.",
    },
    {
      id: "res_2",
      title: "Deep Learning Specialization Notes",
      source: "GitHub",
      sourceUrl: "https://github.com/example",
      rating: 4.8,
      description:
        "Well-structured GitHub repository containing notes, code, and explanations for deep learning concepts.",
    },
    {
      id: "res_3",
      title: "Backpropagation Explained",
      source: "YouTube",
      sourceUrl: "https://youtube.com/example2",
      rating: 4.4,
      description:
        "Conceptual explanation of backpropagation with animations and math intuition.",
    }
  ]
};


