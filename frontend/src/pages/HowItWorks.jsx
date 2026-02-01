import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";
import {
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { howItWorksSteps } from "../data/howItWorksTimeline";
import { useInView } from "../hooks/useInView";

const NEON = "#00ff88";

/* =====================================================
   DESKTOP TIMELINE ITEM (LEFT / RIGHT)
===================================================== */
const DesktopTimelineItem = ({ step, isLast, align }) => {
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

/* =====================================================
   MOBILE CARD (STACKED)
===================================================== */
const MobileTimelineCard = ({ step, index }) => {
  const { ref, isVisible } = useInView();

  return (
    <Box
      ref={ref}
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(14px)",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "16px",
        mb: "24px",
        position: "relative",
      }}
    >
      {/* Step Indicator */}
      <Box
        sx={{
          position: "absolute",
          top: "-12px",
          left: "16px",
          background: NEON,
          color: "#000",
          px: "10px",
          py: "2px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        STEP {index + 1}
      </Box>

      <Typography variant="subtitle1" sx={{ color: "white", fontWeight: 600 }}>
        {step.title}
      </Typography>

      <Typography variant="body2" sx={{ color: NEON, mb: 1 }}>
        {step.subtitle}
      </Typography>

      <Typography variant="body2" sx={{ color: "#d1d5db", lineHeight: 1.6 }}>
        {step.description}
      </Typography>
    </Box>
  );
};

/* =====================================================
   DESKTOP TIMELINE WRAPPER
===================================================== */
const DesktopTimeline = () => (
  <Timeline position="alternate">
    {howItWorksSteps.map((step, index) => (
      <DesktopTimelineItem
        key={index}
        step={step}
        isLast={index === howItWorksSteps.length - 1}
        align={index % 2 === 0 ? "left" : "right"}
      />
    ))}
  </Timeline>
);

/* =====================================================
   MOBILE TIMELINE WRAPPER
===================================================== */
const MobileTimeline = () => (
  <Box>
    {howItWorksSteps.map((step, index) => (
      <MobileTimelineCard key={index} step={step} index={index} />
    ))}
  </Box>
);

/* =====================================================
   MAIN SECTION
===================================================== */
const HowItWorks = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden px-4 py-16">
      {/* Ambient Glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[160px]"
        style={{ background: "rgba(0,255,136,0.12)" }}
      />

      {/* Hero */}
      <div className="relative z-10 max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          How <span style={{ color: NEON }}>RecMind</span> Works
        </h1>
        <p className="text-gray-400">
          A hybrid recommendation system evolving from semantic intelligence to
          collaborative personalization.
        </p>
      </div>

      {/* Timeline Container */}
      <Box
        className="relative z-10 max-w-5xl mx-auto rounded-2xl px-4 py-8"
        sx={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 60px rgba(0,255,136,0.08)",
        }}
      >
        {isMobile ? <MobileTimeline /> : <DesktopTimeline />}
      </Box>

      {/* Footer */}
      <div className="relative z-10 max-w-3xl mx-auto text-center mt-16 text-gray-400 text-sm">
        As user interactions grow, RecMind gradually transitions from cold-start
        intelligence to fully personalized recommendations.
      </div>
    </div>
  );
};

export default HowItWorks;
