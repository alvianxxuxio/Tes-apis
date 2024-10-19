import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import path from 'path';
import moment from 'moment-timezone';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import qs from 'qs';
import fetch from 'node-fetch';
import axios from 'axios';
import cheerio from 'cheerio';
import needle from 'needle';
import { API_KEY, CREATOR } from '../../../settings';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { text } = req.body;

    const apiKey = req.headers['api_key'];
    if (!apiKey || !API_KEY.includes(apiKey)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const result = await llama3(text);
      res.status(200).json({status: true, creator: CREATOR, data: result});
    } catch (error) {
      res.status(500).json({status: false, creator: CREATOR, error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({status: false, creator: CREATOR, error: 'Method Not Allowed' });
  }
}

const model = '70b'
async function llama3(query) {
if (!["70b", "8b"].some(qq => model == qq)) model = "70b"; //correct
try {
    const BASE_URL = 'https://llama3-enggan-ngoding.vercel.app/api/llama'; //@Irulll
    const payload = {
        messages: [
    {
      role: "system",
      content: `kamu adalah AI yang bernama llama AI`
    },
    {
      role: "user",
      content: query
    }
  ],
  model: '70b'
    };
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Mobile/15E148',
        },
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    return data.output;
        } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}