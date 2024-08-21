---
layout: post
title:  "Thoughts on the 'one step trap' of intelligence"
date:   2024-08-01 20:34:19 -0500
categories: jekyll update
header-img: "media/img/header.png"
author: Yassine
comments: true
---

I recently watched a talk by Rich Sutton from 2017. While many things he mentions in his talk are now almost taken for granted. Topics like:

Moore’s law’s inpact on the advances of AI: Scalable methods beat hand coded algorithms
Search and (deep) Learning are scalable methods
This blog post is not directly discussing the topics above, rather another idea that got very little credit, but is very important in today’s AI pursuit.

The one-step trap of machine intelligence
Rich starts by stating that classic Supervised Learning is only partially scalable, it is limited by datasets, that are curated and made by humans. Which is the case of LLM “Base Models” trained only to mimic human language. This is shared now by most AI researchers, which is why AI models are trained with additional steps, on top of the Supervised Pretraining.

Let’s now interpret LLMs as world models st+1=f(ot)(). We can sample LLMs simply by sampling from the token distribution. But in practice, this diverges as we sample more tokens, especially for base models. Practitioners have adopted all sorts of tricks and heuristics to stabilize the sampling (top_k sampling, repetition penalty, temperature, etc.) because doing any kind of higher level sampling (e.g. beam search) is prohibitively expensive.

Higher order training methods were also adoped (e.g. Reinforcement Learning with Human Feedback) which only slightly updates the model to take into consideration longer term token predictions st+1,st+2,st+3,... using the feedback from a fixed value model.

However, classic Reinforcement Learning is also only partially scalable. And this is the crux of the one-step (k-step) trap.

Classic RL trains a policy model to maximize the discounted sum of future values. While this is fine and scalable in theory, the more in the future the value function needs to look, the more variance it encounters.

In practice, RL models do not plan too far in the future, and the common discount factor γ=0.99 decays to 6e−3 in 500 steps (for reference, most environments in gym can last around 1000 steps, and a high school essay can be around 1,300 tokens). For the original MuZero algorithm, the world model is only unrolled for 5 steps during training.

This post by Andrej Karpathy criticizes RLHF as being barely RL. He states that no real RL training was done using LLMs becausse the reward function is hard to formulate. While this is also true in general, even with well behaved reward functions,