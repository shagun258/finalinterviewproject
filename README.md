# 🎯 Interview Performance Analyzer

An AI-powered web application designed to help students and job seekers practice interviews, analyze their responses, and improve their interview performance through AI-based feedback.

---

## 📌 Overview

The **Interview Performance Analyzer** is an interactive interview preparation platform that simulates technical interviews and analyzes a candidate's responses.

The application allows users to:

- Select an interview domain
- Choose interview difficulty
- Answer questions using voice
- Convert speech into text
- Analyze responses using NLP
- Detect filler words and speaking patterns
- Calculate a confidence score
- Receive AI-powered feedback
- Track interview performance

The goal is to provide a practical environment where users can practice interviews and identify areas for improvement before attending real interviews.

---

## ✨ Key Features

### 🎤 Voice-Based Interview
Users can answer interview questions using their microphone instead of typing their responses.

### 🤖 AI-Powered Question Generation
Interview questions can be generated according to the selected domain and difficulty level.

### 🧠 Answer Analysis
The application analyzes the candidate's response and provides meaningful feedback.

### 📊 Confidence Analysis
A confidence score is calculated using factors such as:

- Response quality
- Speaking patterns
- Filler words
- Answer length
- Response structure

### 🗣️ Speech Recognition
Voice responses are converted into text for further analysis.

### 🔍 Filler Word Detection
The system identifies commonly used filler words and helps users become more aware of their speaking habits.

### 📈 Performance Feedback
Users receive feedback that can help them understand their strengths and areas that require improvement.

---

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Vite

### AI / NLP
- Generative AI
- Natural Language Processing
- Speech Recognition
- AI-based response analysis

### Development Tools
- Git
- GitHub
- VS Code
- npm

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │        User         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Interview Setup    │
                    │ Domain + Difficulty │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ AI Question         │
                    │ Generation           │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Interview Question  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Voice Response      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Speech-to-Text      │
                    └──────────┬──────────┘
                               │
                               ▼
             ┌─────────────────┴─────────────────┐
             │                                   │
             ▼                                   ▼
    ┌─────────────────┐                 ┌─────────────────┐
    │ NLP Analysis    │                 │ Speech Analysis │
    │                 │                 │                 │
    │ Answer Quality  │                 │ Filler Words    │
    │ Relevance       │                 │ Speaking Data   │
    └────────┬────────┘                 └────────┬────────┘
             │                                   │
             └─────────────────┬─────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Performance &       │
                    │ Confidence Score    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ AI Feedback &       │
                    │ Recommendations     │
                    └─────────────────────┘
