interface LuchadorMaskProps {
  size?: number;
  className?: string;
}

export function LuchadorMask({ size = 68, className }: LuchadorMaskProps) {
  return (
    <svg
      className={className}
      width={size}
      height={Math.round(size * 1.2)}
      viewBox="0 0 200 240"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M100 8 C152 8 184 50 184 104 C184 174 146 232 100 232 C54 232 16 174 16 104 C16 50 48 8 100 8 Z"
        fill="#d91f2d"
        stroke="#ffd76a"
        strokeWidth="7"
      />
      <path
        d="M30 130 C36 152 48 172 66 186 C52 168 44 150 40 130 Z"
        fill="#ffd76a"
        stroke="#7a0d16"
        strokeWidth="3"
      />
      <path
        d="M170 130 C164 152 152 172 134 186 C148 168 156 150 160 130 Z"
        fill="#ffd76a"
        stroke="#7a0d16"
        strokeWidth="3"
      />
      <path
        d="M90 84 C66 68 40 74 28 98 C46 82 68 80 86 92 Z"
        fill="#ffd76a"
        stroke="#7a0d16"
        strokeWidth="3"
      />
      <path
        d="M110 84 C134 68 160 74 172 98 C154 82 132 80 114 92 Z"
        fill="#ffd76a"
        stroke="#7a0d16"
        strokeWidth="3"
      />
      <path
        d="M100 18 C122 30 136 52 132 82 C126 66 114 56 100 52 C86 56 74 66 68 82 C64 52 78 30 100 18 Z"
        fill="#ffd76a"
        stroke="#7a0d16"
        strokeWidth="3"
      />
      <path
        d="M34 112 C46 94 76 94 90 112 C76 132 46 132 34 112 Z"
        fill="#fdf7ea"
        stroke="#ffd76a"
        strokeWidth="5"
      />
      <path
        d="M166 112 C154 94 124 94 110 112 C124 132 154 132 166 112 Z"
        fill="#fdf7ea"
        stroke="#ffd76a"
        strokeWidth="5"
      />
      <path
        d="M62 168 C62 154 138 154 138 168 C138 192 120 206 100 206 C80 206 62 192 62 168 Z"
        fill="#fdf7ea"
        stroke="#ffd76a"
        strokeWidth="5"
      />
      <path
        d="M78 174 C78 166 122 166 122 174 C122 188 112 196 100 196 C88 196 78 188 78 174 Z"
        fill="#140b0d"
      />
      <path d="M100 126 L110 146 L100 158 L90 146 Z" fill="#ffd76a" stroke="#7a0d16" strokeWidth="3" />
    </svg>
  );
}
