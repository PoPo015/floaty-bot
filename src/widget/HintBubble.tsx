import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  show: boolean;
  text: string;
  onDismiss: () => void;
}

export function HintBubble({ show, text, onDismiss }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 12, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 12, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          style={{
            position: 'absolute',
            right: 80,
            bottom: 14,
            background: '#FFFFFF',
            color: '#2B2D42',
            padding: '10px 14px',
            borderRadius: 14,
            fontSize: 13,
            lineHeight: 1.4,
            maxWidth: 220,
            boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {text}
          <button
            onClick={onDismiss}
            aria-label="닫기"
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              width: 18,
              height: 18,
              borderRadius: '50%',
              border: 'none',
              background: '#2B2D42',
              color: 'white',
              fontSize: 10,
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ×
          </button>
          <div
            style={{
              position: 'absolute',
              right: -6,
              bottom: 18,
              width: 12,
              height: 12,
              background: '#FFFFFF',
              transform: 'rotate(45deg)',
              boxShadow: '2px -2px 4px rgba(0,0,0,0.04)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
