import { useState } from 'react';
import { Comment } from '../types';
import { orderAPI } from '../services/api';
import { ModalPrompt } from './ModalPrompt';

interface CommentSectionProps {
  comments: Comment[];
  orderId: string;
  isAdmin?: boolean;
  onUpdate?: () => void;
}

export const CommentSection = ({ comments, orderId, isAdmin = false, onUpdate }: CommentSectionProps) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptConfig, setPromptConfig] = useState<{
    commentId: string;
    status: 'approved' | 'rejected';
    title: string;
    message: string;
  } | null>(null);

  const handleSubmit = async (type: 'comment' | 'modification_request') => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      await orderAPI.addComment(orderId, content, type);
      setContent('');
      onUpdate?.();
    } catch (error) {
      console.error('提交失败:', error);
    }
    setIsSubmitting(false);
  };

  const handleReply = async (commentId: string, status: 'approved' | 'rejected', reply: string) => {
    try {
      await orderAPI.handleModification(orderId, commentId, status, reply);
      onUpdate?.();
    } catch (error) {
      console.error('处理失败:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">评论与反馈</h3>
      
      {!isAdmin && (
        <div className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下您的评论或修改请求..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none"
            rows={3}
          />
          <div className="flex space-x-4 mt-3">
            <button
              onClick={() => handleSubmit('comment')}
              disabled={isSubmitting}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              {isSubmitting ? '提交中...' : '发表评论'}
            </button>
            <button
              onClick={() => handleSubmit('modification_request')}
              disabled={isSubmitting}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              {isSubmitting ? '提交中...' : '发起修改请求'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">暂无评论</p>
        ) : (
          comments.map((comment, index) => (
            <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-xs px-2 py-1 rounded-full mr-2 ${
                    comment.type === 'modification_request' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {comment.type === 'modification_request' ? '修改请求' : '评论'}
                  </span>
                  {comment.status && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      comment.status === 'approved' ? 'bg-green-100 text-green-600' :
                      comment.status === 'rejected' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {comment.status === 'approved' ? '已通过' :
                       comment.status === 'rejected' ? '已拒绝' : '待处理'}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-gray-700">{comment.content}</p>
              
              {comment.reply && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">管理员回复:</p>
                  <p className="text-sm text-gray-700">{comment.reply}</p>
                </div>
              )}

              {isAdmin && comment.type === 'modification_request' && comment.status === 'pending' && (
                <div className="flex space-x-3 mt-3">
                  <button
                    onClick={() => {
                      setPromptConfig({
                        commentId: comment._id!,
                        status: 'approved',
                        title: '通过修改请求',
                        message: '请输入回复内容:',
                      });
                      setShowPrompt(true);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm"
                  >
                    通过
                  </button>
                  <button
                    onClick={() => {
                      setPromptConfig({
                        commentId: comment._id!,
                        status: 'rejected',
                        title: '拒绝修改请求',
                        message: '请输入拒绝理由:',
                      });
                      setShowPrompt(true);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                  >
                    拒绝
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <ModalPrompt
        isOpen={showPrompt}
        onClose={() => setShowPrompt(false)}
        onConfirm={(reply) => {
          if (promptConfig) {
            handleReply(promptConfig.commentId, promptConfig.status, reply);
          }
        }}
        title={promptConfig?.title}
        message={promptConfig?.message || ''}
        placeholder="请输入内容..."
      />
    </div>
  );
};