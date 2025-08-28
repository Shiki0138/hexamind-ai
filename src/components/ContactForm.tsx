'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        
        // Reset form after 5 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({
            name: '',
            company: '',
            email: '',
            phone: '',
            message: ''
          });
        }, 5000);
      } else {
        alert(result.error || 'エラーが発生しました。');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('エラーが発生しました。時間をおいて再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="p-8 bg-green-900/20 border-green-700 text-center">
        <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">送信完了しました</h3>
        <p className="text-slate-300">お問い合わせいただきありがとうございます。<br />担当者より2営業日以内にご連絡させていただきます。</p>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Contact Info */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold mb-6">お問い合わせ先</h3>
        
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="flex items-start space-x-4">
            <BuildingOfficeIcon className="w-6 h-6 text-blue-400 mt-1" />
            <div>
              <h4 className="font-semibold mb-2">合同会社Leadfive</h4>
              <p className="text-slate-400 text-sm">
                〒530-0001<br />
                大阪府大阪市北区梅田１－１３－１<br />
                大阪梅田ツインタワーズ・サウス１５階
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="flex items-start space-x-4">
            <PhoneIcon className="w-6 h-6 text-blue-400 mt-1" />
            <div>
              <h4 className="font-semibold mb-2">電話番号</h4>
              <p className="text-slate-400">06-7713-6747</p>
              <p className="text-sm text-slate-500 mt-1">営業時間: 平日 9:00-18:00</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="flex items-start space-x-4">
            <EnvelopeIcon className="w-6 h-6 text-blue-400 mt-1" />
            <div>
              <h4 className="font-semibold mb-2">メールアドレス</h4>
              <p className="text-slate-400">leadfive.138@gmail.com</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Contact Form */}
      <Card className="p-8 bg-slate-800/50 border-slate-700">
        <h3 className="text-2xl font-bold mb-6">お問い合わせフォーム</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                お名前 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="山田 太郎"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                会社名
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="株式会社〇〇"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                メールアドレス <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                電話番号
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="06-1234-5678"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              お問い合わせ内容 <span className="text-red-400">*</span>
            </label>
            <textarea
              name="message"
              required
              rows={5}
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 focus:border-blue-500 focus:outline-none transition-colors resize-none"
              placeholder="お問い合わせ内容をご記入ください"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? '送信中...' : '送信する'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ContactForm;