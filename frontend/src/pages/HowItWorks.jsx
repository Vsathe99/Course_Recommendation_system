import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";
import { Box, Typography } from "@mui/material";
import { howItWorksSteps } from "../data/howItWorksTimeline";
import { useInView } from "../hooks/useInView";

const NEON = "#00ff88";

const HowItWorksItem = ({ step, isLast, align }) => {
  const { ref, isVisible } = useInView();

  return (
    <TimelineItem ref={ref} position={align}>
      <TimelineSeparator>
        <TimelineDot
          sx={{
            backgroundColor: NEON,
            boxShadow: "0 0 20px rgba(0,255,136,0.8)",
          }}
        />
        {!isLast && (
          <TimelineConnector sx={{ backgroundColor: NEON }} />
        )}
      </TimelineSeparator>

      <TimelineContent>
        <Box
          sx={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible
              ? "translateY(0)"
              : "translateY(60px)",
            transition: "all 1s cubic-bezier(0.22, 1, 0.36, 1)",
            background: "rgba(255,255,255,0.035)",
            backdropFilter: "blur(16px)",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "18px",
            marginBottom: "40px",
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "white", fontWeight: 600 }}
          >
            {step.title}
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: NEON, mb: 1 }}
          >
            {step.subtitle}
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "#d1d5db" }}
          >
            {step.description}
          </Typography>
        </Box>
      </TimelineContent>
    </TimelineItem>
  );
};

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden px-6 py-20">

      {/* Ambient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[160px]"
        style={{ background: "rgba(0,255,136,0.12)" }}
      />

      {/* Hero */}
      <div className="relative z-10 max-w-4xl mx-auto text-center mb-20">
        <h1 className="text-4xl font-bold mb-4">
          How <span style={{ color: NEON }}>RecMind</span> Works
        </h1>
        <p className="text-gray-400 text-lg">
          A hybrid recommendation system evolving from semantic intelligence to
          collaborative personalization.
        </p>
      </div>

      {/* Timeline */}
      <Box
        className="relative z-10 max-w-5xl mx-auto rounded-2xl border px-6 py-12"
        sx={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(18px)",
          borderColor: "rgba(255,255,255,0.1)",
          boxShadow: "0 0 60px rgba(0,255,136,0.08)",
        }}
      >
        <Timeline position="alternate">
          {howItWorksSteps.map((step, index) => (
            <HowItWorksItem
              key={index}
              step={step}
              isLast={index === howItWorksSteps.length - 1}
              align={index % 2 === 0 ? "left" : "right"}
            />
          ))}
        </Timeline>
      </Box>

      {/* Footer */}
      <div className="relative z-10 max-w-3xl mx-auto text-center mt-20 text-gray-400 text-sm">
        As user interactions grow, RecMind gradually transitions from cold-start
        intelligence to fully personalized recommendations.
      </div>
    </div>
  );
};

export default HowItWorks;
