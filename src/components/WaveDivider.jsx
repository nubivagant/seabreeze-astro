// WaveDivider.jsx
export default function WaveDivider({ className = "" }) {
  return (
    <div className={`w-full flex justify-center ${className}`}>
      <div className="w-3/5"> {/* 60% width */}
        <svg
          className="w-full h-12 md:h-16 lg:h-20"
          viewBox="0 0 1200 50"
          preserveAspectRatio="none"
        >
          <path
            className="stroke-accent-500 fill-none"
            strokeWidth="1"
            d="M0,25 C200,50 400,0 600,25 C800,50 1000,0 1200,25"
          ></path>
        </svg>
      </div>
    </div>
  );
}
