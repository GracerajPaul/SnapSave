
import React from 'react';
import { 
  Shield, Lock, Trash2, Clock, Share2, Upload, Download, 
  Eye, EyeOff, AlertTriangle, Instagram, Twitter, Youtube, 
  Mail, ExternalLink, Trophy, Cpu, Zap, Brain
} from 'lucide-react';

export const APP_NAME = "SnapSave";
export const TAGLINE = "Secure Multi-Format Asset Vault";
export const TG_BOT_TOKEN = "8585527211:AAFe2LSDTn_EnKqwCKiBt9f_CKi1VJJttOQ";
export const TG_CHAT_ID = "7303640347";

export const ICONS = {
  Shield: <Shield className="w-5 h-5" />,
  Lock: <Lock className="w-5 h-5" />,
  Trash: <Trash2 className="w-5 h-5" />,
  Clock: <Clock className="w-5 h-5" />,
  Share: <Share2 className="w-5 h-5" />,
  Upload: <Upload className="w-5 h-5" />,
  Download: <Download className="w-5 h-5" />,
  Eye: <Eye className="w-5 h-5" />,
  EyeOff: <EyeOff className="w-5 h-5" />,
  Emergency: <AlertTriangle className="w-5 h-5" />,
  Instagram: <Instagram className="w-5 h-5" />,
  Twitter: <Twitter className="w-5 h-5" />,
  Youtube: <Youtube className="w-5 h-5" />,
  Mail: <Mail className="w-5 h-5" />,
  ExternalLink: <ExternalLink className="w-5 h-5" />,
  Trophy: <Trophy className="w-5 h-5" />,
  Cpu: <Cpu className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Brain: <Brain className="w-5 h-5" />,
};

/**
 * Technical Constraints:
 * Telegram Bot API has a hard 50MB limit for sendDocument via standard Bot API.
 * This app supports images, videos, documents, and archives.
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_FAILED_ATTEMPTS = 5;
