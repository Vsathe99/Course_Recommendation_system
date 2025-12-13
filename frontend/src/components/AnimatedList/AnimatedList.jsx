import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "motion/react";
import "./AnimatedList.css";
import ResultCard from "../ResultCard";

/* ---------------- Animated Item ---------------- */

const AnimatedItem = ({
  children,
  delay = 0,
  index,
  onMouseEnter,
  onClick,
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.4 });

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : {}}
      transition={{ duration: 0.25, delay }}
      className="cursor-pointer"
    >
      {children}
    </motion.div>
  );
};

/* ---------------- Animated List ---------------- */

const AnimatedList = ({
  items = [],
  onItemSelect,
  onToggleLiked,
  onToggleSaved,
  onSetRating,
  className = "",
  displayScrollbar = true,
  enableArrowNavigation = true,
  initialSelectedIndex = -1,
}) => {
  const listRef = useRef(null);

  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

  /* -------- Scroll gradient handling -------- */

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));

    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1)
    );
  };

  /* -------- Keyboard navigation -------- */

  useEffect(() => {
    if (!enableArrowNavigation) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        if (selectedIndex >= 0 && items[selectedIndex]) {
          onItemSelect?.(items[selectedIndex], selectedIndex);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation]);

  /* -------- Auto scroll selected item -------- */

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;

    const container = listRef.current;
    const el = container.querySelector(`[data-index="${selectedIndex}"]`);

    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  /* ---------------- Render ---------------- */

  return (
    <div className={`scroll-list-container ${className}`}>
      <div
        ref={listRef}
        className={`scroll-list flex flex-col gap-4 ${!displayScrollbar ? "no-scrollbar" : ""}`}
        onScroll={handleScroll}
      >
        {items.map((item, index) => (
          <AnimatedItem
            key={item.id}
            index={index}
            delay={index * 0.04}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => {
              setSelectedIndex(index);
              onItemSelect?.(item, index);
            }}
          >
            <ResultCard
              item={item}
              onToggleLiked={onToggleLiked}
              onToggleSaved={onToggleSaved}
              onSetRating={onSetRating}
            />
          </AnimatedItem>
        ))}
      </div>

      {/* Optional gradients if you use them in CSS */}
      <div
        className="scroll-gradient top"
        style={{ opacity: topGradientOpacity }}
      />
      <div
        className="scroll-gradient bottom"
        style={{ opacity: bottomGradientOpacity }}
      />
    </div>
  );
};

export default AnimatedList;
