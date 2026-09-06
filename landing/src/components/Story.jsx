import React from "react";
import { motion } from "motion/react";
import { Sparkles, Compass, Cpu, HeartHandshake } from "lucide-react";

export const Story = () => {
  return (
    <section className="py-8 sm:py-16 md:py-24 border-t border-border/40 relative" id="story">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col gap-6 sm:gap-12">
        {/* Section Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-black text-xs uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> The Origin Story
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-text">
            From Late-Night Prototyping to <br className="hidden sm:inline" />
            <span className="text-primary">Party Unlocks</span>
          </h2>
          <p className="text-muted text-sm sm:text-base max-w-xl leading-relaxed">
            The human spark behind Guess Up: how board game night frustration turned into an instant motion-activated guessing game.
          </p>
        </div>

        {/* Editorial Story Layout */}
        <div className="flex flex-col gap-5 sm:gap-8">
          {/* Chapter 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface-card border border-border backdrop-blur-md flex flex-col sm:flex-row gap-4 sm:gap-6 items-start shadow-md hover:border-primary/40 transition-all"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/15 border border-primary/40 flex items-center justify-center text-primary font-black shrink-0">
              <Compass className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[0.7rem] font-black uppercase text-primary tracking-widest">Chapter 1</span>
              <h3 className="text-xl font-extrabold text-text">The Board Game Night Frustration</h3>
              <p className="text-muted text-xs sm:text-sm leading-relaxed">
                It started during a Friday night house party. We were trying to play charades, but existing mobile apps were littered with mandatory video ads, clunky user interfaces, and generic decks that lacked authentic Indian pop-culture references. We knew there had to be a better way to bring friends together.
              </p>
            </div>
          </motion.div>

          {/* Chapter 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface-card border border-border backdrop-blur-md flex flex-col sm:flex-row gap-4 sm:gap-6 items-start shadow-md hover:border-primary/40 transition-all"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/15 border border-primary/40 flex items-center justify-center text-primary font-black shrink-0">
              <Cpu className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[0.7rem] font-black uppercase text-primary tracking-widest">Chapter 2</span>
              <h3 className="text-xl font-extrabold text-text">The Gyroscope Breakthrough</h3>
              <p className="text-muted text-xs sm:text-sm leading-relaxed">
                During late-night prototyping, we tapped directly into hardware accelerometer and gyroscope streams. By calculating live gravity orientation vectors at 60 FPS, phone tilts felt instant: nod down for a point, tilt back to pass. No buttons needed while the phone rests on your forehead.
              </p>
            </div>
          </motion.div>

          {/* Chapter 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface-card border border-border backdrop-blur-md flex flex-col sm:flex-row gap-4 sm:gap-6 items-start shadow-md hover:border-primary/40 transition-all"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/15 border border-primary/40 flex items-center justify-center text-primary font-black shrink-0">
              <HeartHandshake className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[0.7rem] font-black uppercase text-primary tracking-widest">Chapter 3</span>
              <h3 className="text-xl font-extrabold text-text">Crafted for Indian Pop Culture</h3>
              <p className="text-muted text-xs sm:text-sm leading-relaxed">
                From 90s Bollywood dialogues and IPL cricket legends to tapri chai memes and hostel life jokes, Guess Up is tailor-made for Indian youth, roomies, and families. Every deck card is hand-curated to spark immediate hilarity.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
