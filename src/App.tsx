/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Play, 
  RotateCcw, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  Shield,
  Ghost,
  Target,
  Clock,
  Skull,
  Star,
  Gamepad2,
  Info,
  Sword,
  Grid3X3,
  Box,
  Home,
  RefreshCw,
  Activity,
  Layers,
  Battery,
  Cpu,
  Eye,
  Wifi,
  Flame,
  Lock
} from 'lucide-react';

// --- Types ---

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface GameMode {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Insane';
  config: {
    initialSpeed: number;
    speedIncrement: number;
    gridSize: number;
    wrapAround: boolean;
    growthPerFood: number;
    hasObstacles: boolean;
    specialRules?: string[];
  };
  specialRules?: string[];
}

// --- Constants & Modes ---

const MODES: GameMode[] = [
  {
    id: 1,
    name: "Classic",
    description: "The original experience. Simple and addictive.",
    icon: <Gamepad2 className="w-5 h-5" />,
    difficulty: 'Easy',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false }
  },
  {
    id: 2,
    name: "2P Battle",
    description: "Two players on one keyboard! P1: WASD, P2: Arrows. Don't crash into each other!",
    icon: <Gamepad2 className="w-5 h-5 text-red-400" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 25, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['2P'] }
  },
  {
    id: 3,
    name: "Speed Up",
    description: "Snake gets significantly faster with every piece of food eaten.",
    icon: <Zap className="w-5 h-5 text-yellow-400" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 10, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false }
  },
  {
    id: 4,
    name: "Powerups",
    description: "Collect different colored items for special temporary abilities.",
    icon: <Zap className="w-5 h-5 text-purple-400" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['POWERUPS'] }
  },
  {
    id: 5,
    name: "Tail Cut",
    description: "Press SPACE to cut your tail in half for a speed boost. Survival is key!",
    icon: <Shield className="w-5 h-5 text-blue-400" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['TAIL_CUT'] }
  },
  {
    id: 6,
    name: "No Walls",
    description: "The edges are portals. Wrap around the screen.",
    icon: <RotateCcw className="w-5 h-5 text-blue-400" />,
    difficulty: 'Easy',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: true, growthPerFood: 1, hasObstacles: false }
  },
  {
    id: 7,
    name: "Ghost Mode",
    description: "You can pass through your own body! Focus on the walls.",
    icon: <Ghost className="w-5 h-5 text-purple-400" />,
    difficulty: 'Easy',
    config: { initialSpeed: 120, speedIncrement: 3, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['GHOST'] }
  },
  {
    id: 8,
    name: "Time Attack",
    description: "You have 60 seconds to eat as much as possible. Go fast!",
    icon: <Clock className="w-5 h-5 text-yellow-400" />,
    difficulty: 'Medium',
    config: { initialSpeed: 120, speedIncrement: 0, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['TIME_ATTACK'] }
  },
  {
    id: 9,
    name: "Shrink Food",
    description: "Some food makes you shorter. Stay small to survive.",
    icon: <Shield className="w-5 h-5 text-green-400" />,
    difficulty: 'Medium',
    config: { initialSpeed: 140, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['SHRINK_FOOD'] }
  },
  {
    id: 10,
    name: "Dark Mode",
    description: "Only the area around your head is visible. Spooky!",
    icon: <Skull className="w-5 h-5 text-gray-600" />,
    difficulty: 'Hard',
    config: { initialSpeed: 160, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['DARK_MODE'] }
  },
  {
    id: 11,
    name: "Lava Floor",
    description: "Random tiles turn into lava every 5 seconds. Don't step on red!",
    icon: <Grid3X3 className="w-5 h-5 text-orange-600" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['LAVA'] }
  },
  {
    id: 12,
    name: "Growing Walls",
    description: "Every time you eat, a new obstacle appears. The arena shrinks!",
    icon: <Box className="w-5 h-5 text-neutral-500" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: true, specialRules: ['GROWING_WALLS'] }
  },
  {
    id: 13,
    name: "Zen Mode",
    description: "No death, no score, just snake. Relax and grow.",
    icon: <Star className="w-5 h-5 text-emerald-300" />,
    difficulty: 'Easy',
    config: { initialSpeed: 150, speedIncrement: 0, gridSize: 20, wrapAround: true, growthPerFood: 1, hasObstacles: false, specialRules: ['ZEN'] }
  },
  {
    id: 14,
    name: "Big Grid",
    description: "A massive 40x40 arena. Lots of space to grow.",
    icon: <Target className="w-5 h-5 text-emerald-400" />,
    difficulty: 'Medium',
    config: { initialSpeed: 100, speedIncrement: 1, gridSize: 40, wrapAround: false, growthPerFood: 1, hasObstacles: false }
  },
  {
    id: 15,
    name: "Tiny Grid",
    description: "A claustrophobic 10x10 arena. Watch your tail!",
    icon: <Target className="w-5 h-5 text-red-400" />,
    difficulty: 'Hard',
    config: { initialSpeed: 200, speedIncrement: 5, gridSize: 10, wrapAround: false, growthPerFood: 1, hasObstacles: false }
  },
  {
    id: 16,
    name: "Obstacles",
    description: "Static blocks appear on the grid. Don't hit them!",
    icon: <Skull className="w-5 h-5 text-red-500" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: true }
  },
  {
    id: 17,
    name: "Portals",
    description: "Enter the blue portal, exit the orange one. Mind the gap!",
    icon: <RotateCcw className="w-5 h-5 text-blue-500" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['PORTALS'] }
  },
  {
    id: 18,
    name: "Magnet",
    description: "Food is attracted to your head. Eat from a distance!",
    icon: <Target className="w-5 h-5 text-red-400" />,
    difficulty: 'Easy',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['MAGNET'] }
  },
  {
    id: 19,
    name: "Reverse Controls",
    description: "Left is Right, Up is Down. Good luck!",
    icon: <RotateCcw className="w-5 h-5 text-orange-400" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['REVERSE'] }
  },
  {
    id: 20,
    name: "Drunk Snake",
    description: "Randomly changes direction every few seconds.",
    icon: <RotateCcw className="w-5 h-5 text-yellow-600" />,
    difficulty: 'Insane',
    config: { initialSpeed: 160, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['DRUNK'] }
  },
  {
    id: 21,
    name: "Rainbow Snake",
    description: "Your body colors change constantly. Groovy!",
    icon: <Star className="w-5 h-5 text-pink-500" />,
    difficulty: 'Easy',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['RAINBOW'] }
  },
  {
    id: 22,
    name: "Gravity",
    description: "A constant force pulls you downwards. Fight the pull!",
    icon: <ChevronRight className="w-5 h-5 text-blue-400 rotate-90" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['GRAVITY'] }
  },
  {
    id: 23,
    name: "Windy Day",
    description: "Strong winds push you to the right. Stay centered!",
    icon: <ChevronRight className="w-5 h-5 text-cyan-400" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['WIND'] }
  },
  {
    id: 24,
    name: "Turbo Dash",
    description: "Hold SHIFT to dash forward. Use it wisely!",
    icon: <Zap className="w-5 h-5 text-yellow-500" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['DASH'] }
  },
  {
    id: 25,
    name: "Slow Motion",
    description: "Hold CTRL to slow down time. Great for tight spots.",
    icon: <Clock className="w-5 h-5 text-blue-300" />,
    difficulty: 'Easy',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['SLOWMO'] }
  },
  {
    id: 26,
    name: "Black Hole",
    description: "A gravity well in the center pulls everything in.",
    icon: <RotateCcw className="w-5 h-5 text-black" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['BLACK_HOLE'] }
  },
  {
    id: 27,
    name: "Electric Snake",
    description: "Touching your tail stuns you for 2 seconds. No death!",
    icon: <Zap className="w-5 h-5 text-yellow-300" />,
    difficulty: 'Easy',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['ELECTRIC'] }
  },
  {
    id: 28,
    name: "Invisible Snake",
    description: "Only your head and tail tip are visible. Trust your memory!",
    icon: <Ghost className="w-5 h-5 text-neutral-800" />,
    difficulty: 'Insane',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['INVISIBLE'] }
  },
  {
    id: 29,
    name: "Flickering Snake",
    description: "The snake flashes in and out of existence. Stay focused!",
    icon: <Zap className="w-5 h-5 text-neutral-400" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['FLICKER'] }
  },
  {
    id: 30,
    name: "Glitch Mode",
    description: "Random tiles swap places every 10 seconds. Chaos!",
    icon: <RotateCcw className="w-5 h-5 text-red-400" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['GLITCH'] }
  },
  {
    id: 31,
    name: "The Mashup",
    description: "Every 10 seconds, a new random rule is applied. Adapt or die!",
    icon: <Settings className="w-5 h-5 text-emerald-500" />,
    difficulty: 'Insane',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['MASHUP'] }
  },
  {
    id: 32,
    name: "Falling Floor",
    description: "The floor disappears behind you! Don't double back.",
    icon: <Grid3X3 className="w-5 h-5 text-red-500" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['FALLING_FLOOR'] }
  },
  {
    id: 33,
    name: "Sokoban Snake",
    description: "Push obstacles out of your way! Clear a path to the food.",
    icon: <Box className="w-5 h-5 text-amber-600" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: true, specialRules: ['SOKOBAN'] }
  },
  {
    id: 34,
    name: "Snake Dungeon",
    description: "Level up as you eat! Each level brings more speed and obstacles.",
    icon: <Sword className="w-5 h-5 text-red-600" />,
    difficulty: 'Hard',
    config: { initialSpeed: 180, speedIncrement: 0, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: true, specialRules: ['DUNGEON'] }
  },
  {
    id: 35,
    name: "Boss Battle",
    description: "A giant shadow follows you. Don't let it catch your tail!",
    icon: <Skull className="w-5 h-5 text-purple-700" />,
    difficulty: 'Insane',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 25, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['BOSS'] }
  },
  {
    id: 36,
    name: "Quantum Snake",
    description: "Every 10 seconds, you swap positions with the food! Disorienting!",
    icon: <RefreshCw className="w-5 h-5 text-indigo-400" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['QUANTUM'] }
  },
  {
    id: 37,
    name: "Mirror Dimension",
    description: "The entire world is mirrored. Left is right, right is left!",
    icon: <RotateCcw className="w-5 h-5 text-pink-400" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['MIRROR'] }
  },
  {
    id: 38,
    name: "Snake Ball",
    description: "The snake is made of bouncy balls! A rounder experience.",
    icon: <Star className="w-5 h-5 text-blue-300" />,
    difficulty: 'Easy',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['BALL'] }
  },
  {
    id: 39,
    name: "ASCII Snake",
    description: "Retro terminal style. Everything is text!",
    icon: <Info className="w-5 h-5 text-neutral-400" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['ASCII'] }
  },
  {
    id: 40,
    name: "Teleport Dash",
    description: "Press 'E' to teleport 3 tiles forward. Has a 2-second cooldown.",
    icon: <Zap className="w-5 h-5 text-cyan-300" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['TELEPORT'] }
  },
  {
    id: 41,
    name: "Speedy Food",
    description: "The food is alive! It moves to a new spot every 3 seconds.",
    icon: <Target className="w-5 h-5 text-green-400" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['SPEEDY_FOOD'] }
  },
  {
    id: 42,
    name: "Double Food",
    description: "Two pieces of food are better than one. Grow twice as fast!",
    icon: <Target className="w-5 h-5 text-emerald-500" />,
    difficulty: 'Easy',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['DOUBLE_FOOD'] }
  },
  {
    id: 43,
    name: "Triple Food",
    description: "Three pieces of food! A feast for the snake.",
    icon: <Target className="w-5 h-5 text-emerald-600" />,
    difficulty: 'Easy',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['TRIPLE_FOOD'] }
  },
  {
    id: 44,
    name: "Snake Trail",
    description: "Your trail leaves temporary obstacles. Don't trap yourself!",
    icon: <Ghost className="w-5 h-5 text-neutral-500" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['TRAIL'] }
  },
  {
    id: 45,
    name: "Minefield",
    description: "Random mines appear. One wrong step and it's over!",
    icon: <Skull className="w-5 h-5 text-red-600" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['MINES'] }
  },
  {
    id: 46,
    name: "Shield Mode",
    description: "You start with a shield. It breaks on collision, giving you a second chance.",
    icon: <Shield className="w-5 h-5 text-blue-500" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['SHIELD'] }
  },
  {
    id: 47,
    name: "Ghost Food",
    description: "The food is invisible most of the time. Watch for the flashes!",
    icon: <Ghost className="w-5 h-5 text-green-200" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['GHOST_FOOD'] }
  },
  {
    id: 48,
    name: "Expanding Grid",
    description: "The arena grows every 5 pieces of food. More space, more speed!",
    icon: <Target className="w-5 h-5 text-emerald-400" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 5, gridSize: 15, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['EXPANDING'] }
  },
  {
    id: 49,
    name: "Shrinking Grid",
    description: "The arena shrinks every 5 pieces of food. Hurry up!",
    icon: <Target className="w-5 h-5 text-red-400" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 0, gridSize: 30, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['SHRINKING'] }
  },
  {
    id: 50,
    name: "Teleport Food",
    description: "The food teleports when you get too close. Corner it!",
    icon: <Zap className="w-5 h-5 text-purple-400" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['TELEPORT_FOOD'] }
  },
  {
    id: 51,
    name: "Bouncy Walls",
    description: "Hit a wall? You'll just bounce back in the opposite direction!",
    icon: <Zap className="w-5 h-5 text-blue-400" />,
    difficulty: 'Easy',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['BOUNCY'] }
  },
  {
    id: 52,
    name: "Tail Drop",
    description: "Every 5 pieces of food, your tail drops and becomes a permanent obstacle.",
    icon: <Ghost className="w-5 h-5 text-orange-500" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['TAIL_DROP'] }
  },
  {
    id: 53,
    name: "Gravity Chaos",
    description: "Gravity, Wind, and Black Holes all at once. Good luck!",
    icon: <Zap className="w-5 h-5 text-indigo-500" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['GRAVITY', 'WIND', 'BLACK_HOLE'] }
  },
  {
    id: 54,
    name: "Limited Vision",
    description: "You can only see 2 tiles around your head. Use your memory!",
    icon: <Ghost className="w-5 h-5 text-neutral-700" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['VISION'] }
  },
  {
    id: 55,
    name: "Color Match",
    description: "Your head changes color. You can only eat food that matches your color!",
    icon: <Target className="w-5 h-5 text-pink-500" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['COLOR_MATCH'] }
  },
  {
    id: 56,
    name: "Number Sequence",
    description: "Eat the numbers in order: 1, 2, 3... Don't skip any!",
    icon: <Target className="w-5 h-5 text-yellow-500" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['NUMBERS'] }
  },
  {
    id: 57,
    name: "Rapid Growth",
    description: "Every food makes you grow 3 tiles. You'll be huge in no time!",
    icon: <Zap className="w-5 h-5 text-green-500" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 3, hasObstacles: false, specialRules: [] }
  },
  {
    id: 58,
    name: "Starvation",
    description: "You shrink every 5 seconds. Eat food to stay alive!",
    icon: <Skull className="w-5 h-5 text-red-400" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 2, hasObstacles: false, specialRules: ['STARVE'] }
  },
  {
    id: 59,
    name: "Portal Storm",
    description: "The arena is filled with portals. Where will you end up?",
    icon: <Zap className="w-5 h-5 text-blue-600" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['PORTAL_STORM'] }
  },
  {
    id: 60,
    name: "Snake Clone",
    description: "A ghost snake follows your exact path. Don't let it touch you!",
    icon: <Ghost className="w-5 h-5 text-cyan-500" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['CLONE'] }
  },
  {
    id: 61,
    name: "Snake Speedrun",
    description: "The speed increases every 2 seconds. How long can you last?",
    icon: <Activity className="w-5 h-5 text-red-500" />,
    difficulty: 'Hard',
    config: { initialSpeed: 200, speedIncrement: 0, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['SPEEDRUN'] }
  },
  {
    id: 62,
    name: "Snake Marathon",
    description: "A slow, long game. The food is rare and the arena is huge.",
    icon: <Activity className="w-5 h-5 text-blue-300" />,
    difficulty: 'Easy',
    config: { initialSpeed: 300, speedIncrement: 1, gridSize: 40, wrapAround: true, growthPerFood: 1, hasObstacles: false, specialRules: [] }
  },
  {
    id: 63,
    name: "Snake Sniper",
    description: "Press Space to shoot a laser and destroy obstacles in your path!",
    icon: <Target className="w-5 h-5 text-red-400" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: true, specialRules: ['SNIPER'] }
  },
  {
    id: 64,
    name: "Snake Builder",
    description: "Press Space to place an obstacle. Use them to block enemies or yourself!",
    icon: <Box className="w-5 h-5 text-amber-600" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['BUILDER'] }
  },
  {
    id: 65,
    name: "Snake Miner",
    description: "Food is hidden inside obstacles. Destroy them to find your meal!",
    icon: <Box className="w-5 h-5 text-stone-500" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: true, specialRules: ['MINER'] }
  },
  {
    id: 66,
    name: "Gravity Shift",
    description: "The direction of gravity changes every 10 seconds. Adapt quickly!",
    icon: <Zap className="w-5 h-5 text-purple-500" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['GRAVITY_SHIFT'] }
  },
  {
    id: 67,
    name: "Dimension Switch",
    description: "Press Space to switch dimensions. Each dimension has its own food and walls!",
    icon: <Layers className="w-5 h-5 text-fuchsia-500" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['DIMENSION'] }
  },
  {
    id: 68,
    name: "Solid Ghost",
    description: "You are a ghost by default. Press Space to become solid and eat food!",
    icon: <Ghost className="w-5 h-5 text-indigo-300" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['SOLID_GHOST'] }
  },
  {
    id: 69,
    name: "Snake Battery",
    description: "Your energy is draining! Eat food to stay powered up.",
    icon: <Battery className="w-5 h-5 text-yellow-400" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['BATTERY'] }
  },
  {
    id: 70,
    name: "Snake Evolution",
    description: "Every 5 food, you gain a new random special rule permanently!",
    icon: <Cpu className="w-5 h-5 text-cyan-400" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['EVOLUTION'] }
  },
  {
    id: 71,
    name: "Snake Jumper",
    description: "Press Space to jump 2 tiles forward, skipping over obstacles and yourself!",
    icon: <Zap className="w-5 h-5 text-yellow-300" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: true, specialRules: ['JUMPER'] }
  },
  {
    id: 72,
    name: "Snake Drifter",
    description: "The snake has momentum. Turning is slow and sliding is common!",
    icon: <Activity className="w-5 h-5 text-blue-400" />,
    difficulty: 'Hard',
    config: { initialSpeed: 100, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['DRIFTER'] }
  },
  {
    id: 73,
    name: "Snake Collector",
    description: "Collect items of all 5 colors to win. Each color gives a different buff!",
    icon: <Trophy className="w-5 h-5 text-amber-400" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['COLLECTOR'] }
  },
  {
    id: 74,
    name: "Snake Defender",
    description: "Protect the center of the arena from incoming red blocks!",
    icon: <Shield className="w-5 h-5 text-red-500" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['DEFENDER'] }
  },
  {
    id: 75,
    name: "Snake Racer",
    description: "Race against a ghost snake. If it finishes its lap before you eat 5 food, you lose!",
    icon: <Activity className="w-5 h-5 text-emerald-400" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: true, growthPerFood: 1, hasObstacles: false, specialRules: ['RACER'] }
  },
  {
    id: 76,
    name: "Snake Puzzle",
    description: "Eat numbers to reach the target sum shown at the top!",
    icon: <Target className="w-5 h-5 text-blue-500" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 0, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['PUZZLE'] }
  },
  {
    id: 77,
    name: "Snake Stealth",
    description: "Avoid the moving searchlights. If they catch you, it's game over!",
    icon: <Eye className="w-5 h-5 text-neutral-400" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['STEALTH'] }
  },
  {
    id: 78,
    name: "Snake Hacker",
    description: "Eat data nodes to unlock new areas of the grid. Don't touch the firewalls!",
    icon: <Lock className="w-5 h-5 text-cyan-600" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: true, specialRules: ['HACKER'] }
  },
  {
    id: 79,
    name: "Snake Glitch",
    description: "The game glitches every 10 seconds. Controls might reverse, visuals might flip!",
    icon: <Wifi className="w-5 h-5 text-pink-600" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['GLITCH_MODE'] }
  },
  {
    id: 80,
    name: "Snake God",
    description: "You are invincible! But you must eat 50 food in 60 seconds to win.",
    icon: <Trophy className="w-5 h-5 text-yellow-500" />,
    difficulty: 'Easy',
    config: { initialSpeed: 100, speedIncrement: 0, gridSize: 20, wrapAround: true, growthPerFood: 1, hasObstacles: false, specialRules: ['GOD_MODE', 'TIME_ATTACK'] }
  },
  {
    id: 81,
    name: "Snake Magnetism",
    description: "Food is attracted to you, but so are the obstacles!",
    icon: <Zap className="w-5 h-5 text-red-500" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: true, specialRules: ['MAGNET', 'ATTRACT_OBSTACLES'] }
  },
  {
    id: 82,
    name: "Snake Mirror",
    description: "A mirror snake mimics your moves on the other side of the grid.",
    icon: <Layers className="w-5 h-5 text-blue-400" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['MIRROR_SNAKE'] }
  },
  {
    id: 83,
    name: "Snake Gravity",
    description: "Gravity pulls you down. Use the arrow keys to fight it!",
    icon: <Zap className="w-5 h-5 text-purple-600" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['GRAVITY'] }
  },
  {
    id: 84,
    name: "Snake Wind",
    description: "Strong winds push you to the right. Stay on course!",
    icon: <Activity className="w-5 h-5 text-cyan-300" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['WIND'] }
  },
  {
    id: 85,
    name: "Snake Black Hole",
    description: "A black hole in the center pulls everything in!",
    icon: <Zap className="w-5 h-5 text-black" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['BLACK_HOLE'] }
  },
  {
    id: 86,
    name: "Snake Electric",
    description: "Touching yourself stuns you for 2 seconds instead of game over.",
    icon: <Zap className="w-5 h-5 text-yellow-400" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['ELECTRIC'] }
  },
  {
    id: 87,
    name: "Snake Quantum",
    description: "You exist in two places at once. If either head hits a wall, you lose!",
    icon: <Layers className="w-5 h-5 text-indigo-500" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['QUANTUM'] }
  },
  {
    id: 88,
    name: "Snake Lava",
    description: "Lava tiles appear randomly. Don't touch them!",
    icon: <Flame className="w-5 h-5 text-orange-600" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['LAVA'] }
  },
  {
    id: 89,
    name: "Snake Growing Walls",
    description: "Walls grow from the edges every 10 seconds!",
    icon: <Box className="w-5 h-5 text-stone-700" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['GROWING_WALLS'] }
  },
  {
    id: 90,
    name: "Snake Speedy Food",
    description: "The food moves every 2 seconds. Catch it if you can!",
    icon: <Activity className="w-5 h-5 text-emerald-500" />,
    difficulty: 'Medium',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['SPEEDY_FOOD'] }
  },
  {
    id: 91,
    name: "Snake Trail",
    description: "You leave a trail of obstacles behind you that last 5 seconds.",
    icon: <Activity className="w-5 h-5 text-neutral-500" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['TRAIL'] }
  },
  {
    id: 92,
    name: "Snake Minefield",
    description: "Mines are scattered everywhere. One wrong move and BOOM!",
    icon: <Zap className="w-5 h-5 text-red-700" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['MINES'] }
  },
  {
    id: 93,
    name: "Snake Shield",
    description: "You start with a shield that protects you from one collision.",
    icon: <Shield className="w-5 h-5 text-blue-500" />,
    difficulty: 'Easy',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['SHIELD'] }
  },
  {
    id: 94,
    name: "Snake Ghost Food",
    description: "Food is invisible most of the time. Watch for the flicker!",
    icon: <Ghost className="w-5 h-5 text-neutral-300" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['GHOST_FOOD'] }
  },
  {
    id: 95,
    name: "Snake Teleport Food",
    description: "Food teleports when you get close to it!",
    icon: <Zap className="w-5 h-5 text-cyan-400" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['TELEPORT_FOOD'] }
  },
  {
    id: 96,
    name: "Snake Bouncy",
    description: "You bounce off walls instead of dying!",
    icon: <Activity className="w-5 h-5 text-pink-400" />,
    difficulty: 'Easy',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['BOUNCY'] }
  },
  {
    id: 97,
    name: "Snake Tail Drop",
    description: "Every 50 points, you drop a piece of your tail as a permanent obstacle!",
    icon: <Activity className="w-5 h-5 text-amber-700" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['TAIL_DROP'] }
  },
  {
    id: 98,
    name: "Snake Vision",
    description: "You can only see a small area around your head.",
    icon: <Eye className="w-5 h-5 text-neutral-600" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['VISION'] }
  },
  {
    id: 99,
    name: "Snake Color Match",
    description: "Your head color changes. You can only eat food when it matches your color!",
    icon: <Zap className="w-5 h-5 text-emerald-400" />,
    difficulty: 'Hard',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: false, specialRules: ['COLOR_MATCH'] }
  },
  {
    id: 100,
    name: "The Ultimate Mashup",
    description: "Every 10 seconds, a random rule from all 100 modes is applied!",
    icon: <Zap className="w-5 h-5 text-red-600" />,
    difficulty: 'Insane',
    config: { initialSpeed: 150, speedIncrement: 2, gridSize: 20, wrapAround: false, growthPerFood: 1, hasObstacles: true, specialRules: ['MASHUP'] }
  }
];

// --- Components ---

export default function App() {
  const [selectedMode, setSelectedMode] = useState<GameMode>(MODES[0]);
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'GAMEOVER'>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const handleStartGame = useCallback((mode: GameMode) => {
    setSelectedMode(mode);
    setGameState('PLAYING');
    setScore(0);
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    if (finalScore > highScore) setHighScore(finalScore);
    setGameState('GAMEOVER');
  }, [highScore]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500/30">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
              SNAKE 100
            </h1>
            <p className="text-neutral-500 text-sm font-medium">The Ultimate Collection</p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">High Score</p>
              <p className="text-xl font-mono font-bold text-emerald-400">{highScore}</p>
            </div>
          </div>
        </header>

        <main className="relative min-h-[650px] bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden shadow-2xl shadow-emerald-900/10 flex flex-col">
          <AnimatePresence mode="wait">
            {gameState === 'MENU' && (
              <motion.div 
                key="menu"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 flex flex-col p-8 overflow-y-auto custom-scrollbar"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Play className="w-6 h-6 text-emerald-500" /> Select a Mode
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => handleStartGame(mode)}
                      className="group relative p-4 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/50 hover:border-emerald-500/50 rounded-2xl transition-all text-left"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-neutral-900 rounded-xl group-hover:scale-110 transition-transform">
                          {mode.icon}
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          mode.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                          mode.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                          mode.difficulty === 'Hard' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {mode.difficulty}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg">{mode.name}</h3>
                      <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2">{mode.description}</p>
                    </button>
                  ))}
                  <div className="p-4 bg-neutral-800/20 border border-dashed border-neutral-700 rounded-2xl flex flex-col items-center justify-center text-neutral-600">
                    <Info className="w-6 h-6 mb-2 opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">More Modes Coming Soon</p>
                  </div>
                </div>
              </motion.div>
            )}

            {gameState === 'PLAYING' && (
              <motion.div 
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col"
              >
                <SnakeGame 
                  mode={selectedMode} 
                  onGameOver={handleGameOver} 
                  onScoreUpdate={setScore}
                  score={score}
                />
              </motion.div>
            )}

            {gameState === 'GAMEOVER' && (
              <motion.div 
                key="gameover"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/80 backdrop-blur-sm p-8 text-center"
              >
                <div className="mb-6 p-6 bg-neutral-900 rounded-full border-4 border-emerald-500/20 shadow-2xl shadow-emerald-500/20">
                  <Trophy className="w-16 h-16 text-emerald-500" />
                </div>
                <h2 className="text-4xl font-black mb-2">GAME OVER</h2>
                <p className="text-neutral-500 mb-8">You achieved a score of <span className="text-emerald-400 font-bold">{score}</span> in {selectedMode.name} mode.</p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleStartGame(selectedMode)}
                    className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-2xl transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" /> Try Again
                  </button>
                  <button 
                    onClick={() => setGameState('MENU')}
                    className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-bold rounded-2xl transition-colors"
                  >
                    Main Menu
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Controls Info */}
        <footer className="mt-8 grid grid-cols-3 gap-4">
          <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800">
            <p className="text-[10px] font-bold text-neutral-600 uppercase mb-2">Movement</p>
            <p className="text-sm font-medium">Arrow Keys / WASD</p>
          </div>
          <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800">
            <p className="text-[10px] font-bold text-neutral-600 uppercase mb-2">Pause</p>
            <p className="text-sm font-medium">ESC Key</p>
          </div>
          <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800">
            <p className="text-[10px] font-bold text-neutral-600 uppercase mb-2">Restart</p>
            <p className="text-sm font-medium">R Key</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

// --- Snake Game Component ---

interface PowerUp {
    pos: Point;
    type: 'SPEED' | 'GHOST' | 'SCORE';
    expires: number;
}

function SnakeGame({ mode, onGameOver, onScoreUpdate, score }: { 
  mode: GameMode; 
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
  score: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>([{ x: 5, y: 10 }]);
  const [snake2, setSnake2] = useState<Point[]>(mode.config.specialRules?.includes('2P') ? [{ x: 15, y: 10 }] : []);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [obstacles, setObstacles] = useState<Point[]>([]);
  const [portals, setPortals] = useState<{ p1: Point; p2: Point } | null>(null);
  const [powerups, setPowerups] = useState<PowerUp[]>([]);
  const [visitedTiles, setVisitedTiles] = useState<Point[]>([]);
  const [lavaTiles, setLavaTiles] = useState<Point[]>([]);
  const [extraFood, setExtraFood] = useState<Point[]>([]);
  const [mines, setMines] = useState<Point[]>([]);
  const [trailObstacles, setTrailObstacles] = useState<{ pos: Point; expires: number }[]>([]);
  const [hasShield, setHasShield] = useState(false);
  const [headColor, setHeadColor] = useState('#34d399');
  const [targetNumber, setTargetNumber] = useState(1);
  const [extraPortals, setExtraPortals] = useState<Point[]>([]);
  const [cloneSnake, setCloneSnake] = useState<Point[]>([]);
  const [energy, setEnergy] = useState(100);
  const [dimension, setDimension] = useState(0);
  const [isSolid, setIsSolid] = useState(false);
  const [dimensionData, setDimensionData] = useState<{ food: Point; obstacles: Point[] }[]>([
      { food: { x: 15, y: 15 }, obstacles: [] },
      { food: { x: 5, y: 5 }, obstacles: [] }
  ]);
  const [projectiles, setProjectiles] = useState<Point[]>([]);
  const [ghostSnake, setGhostSnake] = useState<Point[]>([]);
  const [targetSum, setTargetSum] = useState(0);
  const [currentSum, setCurrentSum] = useState(0);
  const [searchlights, setSearchlights] = useState<{ x: number; y: number; radius: number }[]>([]);
  const [unlockedGrid, setUnlockedGrid] = useState<Point[]>([]);
  const [pendingDirection, setPendingDirection] = useState<Direction | null>(null);
  const [collectedColors, setCollectedColors] = useState<string[]>([]);
  const [currentGridSize, setCurrentGridSize] = useState(mode.config.gridSize);
  const [bossPos, setBossPos] = useState<Point>({ x: 0, y: 0 });
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [teleportCooldown, setTeleportCooldown] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isStunned, setIsStunned] = useState(false);
  const [isDashing, setIsDashing] = useState(false);
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [activeRules, setActiveRules] = useState<string[]>(mode.config.specialRules || []);
  const [speed, setSpeed] = useState(mode.config.initialSpeed);
  const [hue, setHue] = useState(0);
  
  const directionRef = useRef<Direction>('RIGHT');
  const direction2Ref = useRef<Direction>('LEFT');
  const lastMoveTime = useRef<number>(0);
  const requestRef = useRef<number>(0);
  const snakeRef = useRef(snake);
  const snake2Ref = useRef(snake2);
  const foodRef = useRef(food);
  const obstaclesRef = useRef(obstacles);
  const scoreRef = useRef(score);
  const energyRef = useRef(energy);
  const timeLeftRef = useRef(timeLeft);

  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { snake2Ref.current = snake2; }, [snake2]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { obstaclesRef.current = obstacles; }, [obstacles]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { energyRef.current = energy; }, [energy]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

  const generateFood = useCallback((currentSnake: Point[], currentSnake2: Point[], currentObstacles: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * mode.config.gridSize),
        y: Math.floor(Math.random() * mode.config.gridSize)
      };
      if (!currentSnake.some(s => s.x === newFood.x && s.y === newFood.y) &&
          (!currentSnake2 || !currentSnake2.some(s => s.x === newFood.x && s.y === newFood.y)) &&
          !currentObstacles.some(o => o.x === newFood.x && o.y === newFood.y)) break;
    }
    return newFood;
  }, [mode.config.gridSize]);

  const generatePowerup = useCallback(() => {
      const types: PowerUp['type'][] = ['SPEED', 'GHOST', 'SCORE'];
      return {
          pos: {
              x: Math.floor(Math.random() * mode.config.gridSize),
              y: Math.floor(Math.random() * mode.config.gridSize)
          },
          type: types[Math.floor(Math.random() * types.length)],
          expires: Date.now() + 8000
      };
  }, [mode.config.gridSize]);

  const generateObstacles = useCallback(() => {
    if (!mode.config.hasObstacles) return [];
    const obs: Point[] = [];
    for (let i = 0; i < 10; i++) {
      obs.push({
        x: Math.floor(Math.random() * mode.config.gridSize),
        y: Math.floor(Math.random() * mode.config.gridSize)
      });
    }
    return obs;
  }, [mode.config.gridSize, mode.config.hasObstacles]);

  useEffect(() => {
    setCurrentGridSize(mode.config.gridSize);
    setSnake([{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }]);
    setSnake2(mode.config.specialRules?.includes('2P') ? [{ x: 15, y: 10 }, { x: 16, y: 10 }, { x: 17, y: 10 }] : []);
    setSpeed(mode.config.initialSpeed);
    setLevel(1);
    setVisitedTiles([]);
    setLavaTiles([]);
    setExtraFood([]);
    setMines([]);
    setHasShield(false);
    setHeadColor('#34d399');
    setTargetNumber(1);
    setExtraPortals([]);
    setCloneSnake([]);
    setEnergy(100);
    setDimension(0);
    setIsSolid(false);
    setDimensionData([
        { food: { x: 15, y: 15 }, obstacles: [] },
        { food: { x: 5, y: 5 }, obstacles: generateObstacles() }
    ]);
    setProjectiles([]);
    setGhostSnake([{ x: 0, y: 0 }]);
    setTargetSum(Math.floor(Math.random() * 50) + 10);
    setCurrentSum(0);
    setSearchlights([{ x: 10, y: 10, radius: 3 }]);
    setUnlockedGrid([]);
    setPendingDirection(null);
    setActiveRules(mode.config.specialRules || []);
    setCollectedColors([]);
    
    const initialObs = generateObstacles();
    setObstacles(initialObs);
    setFood(generateFood([{ x: 5, y: 10 }], mode.config.specialRules?.includes('2P') ? [{ x: 15, y: 10 }] : [], initialObs));
    
    if (mode.config.specialRules?.includes('PORTALS')) {
        setPortals({
            p1: { x: 2, y: 2 },
            p2: { x: mode.config.gridSize - 3, y: mode.config.gridSize - 3 }
        });
    } else {
        setPortals(null);
    }

    if (mode.config.specialRules?.includes('TIME_ATTACK')) {
        setTimeLeft(60);
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timer);
                    onGameOver(scoreRef.current);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }

    if (mode.config.specialRules?.includes('POWERUPS')) {
        const interval = setInterval(() => {
            setPowerups(prev => [...prev.filter(p => p.expires > Date.now()), generatePowerup()]);
        }, 5000);
        return () => clearInterval(interval);
    }

    if (mode.config.specialRules?.includes('MASHUP')) {
        const interval = setInterval(() => {
            const allRules = ['GHOST', 'SHRINK_FOOD', 'REVERSE', 'DRUNK', 'DARK_MODE', 'RAINBOW', 'MAGNET', 'GRAVITY', 'WIND', 'BLACK_HOLE', 'ELECTRIC', 'INVISIBLE', 'FLICKER', 'QUANTUM', 'LAVA', 'GROWING_WALLS', 'SPEEDY_FOOD', 'TRAIL', 'MINES', 'GHOST_FOOD', 'TELEPORT_FOOD', 'BOUNCY', 'TAIL_DROP', 'VISION', 'COLOR_MATCH', 'NUMBERS', 'PORTAL_STORM', 'CLONE', 'SPEEDRUN', 'BATTERY'];
            const randomRule = allRules[Math.floor(Math.random() * allRules.length)];
            setActiveRules([randomRule]);
        }, 10000);
        return () => clearInterval(interval);
    } else {
        setActiveRules(mode.config.specialRules || []);
    }

    if (mode.config.specialRules?.includes('QUANTUM')) {
        const interval = setInterval(() => {
            setSnake(prev => {
                const head = prev[0];
                const tail = prev.slice(1);
                return [food, ...tail];
            });
            setFood(snakeRef.current[0]);
        }, 10000);
        return () => clearInterval(interval);
    }
    if (mode.config.specialRules?.includes('LAVA')) {
        const interval = setInterval(() => {
            const newLava: Point[] = [];
            for (let i = 0; i < 10; i++) {
                newLava.push({
                    x: Math.floor(Math.random() * currentGridSize),
                    y: Math.floor(Math.random() * currentGridSize)
                });
            }
            setLavaTiles(newLava);
        }, 5000);
        return () => clearInterval(interval);
    }

    if (mode.config.specialRules?.includes('SPEEDY_FOOD')) {
        const interval = setInterval(() => {
            setFood(generateFood(snakeRef.current, snake2Ref.current, obstaclesRef.current));
        }, 3000);
        return () => clearInterval(interval);
    }

    if (mode.config.specialRules?.includes('DOUBLE_FOOD')) {
        setExtraFood([generateFood(snakeRef.current, snake2Ref.current, obstaclesRef.current)]);
    }
    if (mode.config.specialRules?.includes('TRIPLE_FOOD')) {
        setExtraFood([generateFood(snakeRef.current, snake2Ref.current, obstaclesRef.current), generateFood(snakeRef.current, snake2Ref.current, obstaclesRef.current)]);
    }
    if (mode.config.specialRules?.includes('MINES')) {
        const newMines: Point[] = [];
        for (let i = 0; i < 5; i++) {
            newMines.push({
                x: Math.floor(Math.random() * currentGridSize),
                y: Math.floor(Math.random() * currentGridSize)
            });
        }
        setMines(newMines);
    }
    if (mode.config.specialRules?.includes('SHIELD')) {
        setHasShield(true);
    }
    if (mode.config.specialRules?.includes('PORTAL_STORM')) {
        const p: Point[] = [];
        for (let i = 0; i < 8; i++) {
            p.push({
                x: Math.floor(Math.random() * currentGridSize),
                y: Math.floor(Math.random() * currentGridSize)
            });
        }
        setExtraPortals(p);
    }
    if (mode.config.specialRules?.includes('STARVE')) {
        const interval = setInterval(() => {
            setSnake(s => s.length > 2 ? s.slice(0, -1) : s);
        }, 5000);
        return () => clearInterval(interval);
    }
    if (mode.config.specialRules?.includes('SPEEDRUN')) {
        const interval = setInterval(() => {
            setSpeed(s => Math.max(50, s - 5));
        }, 2000);
        return () => clearInterval(interval);
    }
    if (mode.config.specialRules?.includes('GRAVITY_SHIFT')) {
        const interval = setInterval(() => {
            const rules = ['GRAVITY', 'WIND', 'BLACK_HOLE', 'NONE'];
            const r = rules[Math.floor(Math.random() * rules.length)];
            setActiveRules(prev => [...prev.filter(x => !rules.includes(x)), ...(r === 'NONE' ? [] : [r])]);
        }, 10000);
        return () => clearInterval(interval);
    }
    if (mode.config.specialRules?.includes('BATTERY')) {
        const interval = setInterval(() => {
            setEnergy(e => {
                if (e <= 2) {
                    clearInterval(interval);
                    onGameOver(scoreRef.current);
                    return 0;
                }
                return e - 2;
            });
        }, 1000);
        return () => clearInterval(interval);
    }
    if (mode.config.specialRules?.includes('DEFENDER')) {
        const interval = setInterval(() => {
            setProjectiles(prev => {
                const side = Math.floor(Math.random() * 4);
                let p = { x: 0, y: 0 };
                if (side === 0) p = { x: Math.floor(Math.random() * currentGridSize), y: 0 };
                if (side === 1) p = { x: Math.floor(Math.random() * currentGridSize), y: currentGridSize - 1 };
                if (side === 2) p = { x: 0, y: Math.floor(Math.random() * currentGridSize) };
                if (side === 3) p = { x: currentGridSize - 1, y: Math.floor(Math.random() * currentGridSize) };
                return [...prev, p];
            });
        }, 2000);
        return () => clearInterval(interval);
    }
    if (mode.config.specialRules?.includes('STEALTH')) {
        const interval = setInterval(() => {
            setSearchlights(prev => prev.map(s => ({
                ...s,
                x: (s.x + (Math.random() > 0.5 ? 1 : -1) + currentGridSize) % currentGridSize,
                y: (s.y + (Math.random() > 0.5 ? 1 : -1) + currentGridSize) % currentGridSize
            })));
        }, 500);
        return () => clearInterval(interval);
    }
    if (mode.config.specialRules?.includes('GLITCH_MODE')) {
        const interval = setInterval(() => {
            const effects = ['REVERSE', 'DRUNK', 'FLICKER', 'NONE'];
            const e = effects[Math.floor(Math.random() * effects.length)];
            setActiveRules(prev => [...prev.filter(x => !effects.includes(x)), ...(e === 'NONE' ? [] : [e])]);
        }, 10000);
        return () => clearInterval(interval);
    }
  }, [generateObstacles, generateFood, mode, onGameOver, generatePowerup]);


  useEffect(() => {
    if (activeRules.includes('GLITCH')) {
        const interval = setInterval(() => {
            setObstacles(generateObstacles());
        }, 5000);
        return () => clearInterval(interval);
    }
  }, [activeRules, generateObstacles]);

  const moveSnake = useCallback(() => {
    if (isPaused || isStunned) return;

    // Drunk Mode logic
    if (activeRules.includes('DRUNK') && Math.random() > 0.95) {
        const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        const randomDir = dirs[Math.floor(Math.random() * dirs.length)];
        // Prevent 180 turns
        if (!(directionRef.current === 'UP' && randomDir === 'DOWN') &&
            !(directionRef.current === 'DOWN' && randomDir === 'UP') &&
            !(directionRef.current === 'LEFT' && randomDir === 'RIGHT') &&
            !(directionRef.current === 'RIGHT' && randomDir === 'LEFT')) {
            directionRef.current = randomDir;
        }
    }

    setSnake(prevSnake => {
      // Drifter Logic
      if (activeRules.includes('DRIFTER') && pendingDirection) {
          directionRef.current = pendingDirection;
          setPendingDirection(null);
      }

      const head = prevSnake[0];
      const newHead = { ...head };

      switch (directionRef.current) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Drift effects
      if (activeRules.includes('GRAVITY') && Math.random() > 0.7) {
          newHead.y += 1;
      }
      if (activeRules.includes('WIND') && Math.random() > 0.7) {
          newHead.x += 1;
      }
      if (activeRules.includes('BLACK_HOLE') && Math.random() > 0.8) {
          const center = mode.config.gridSize / 2;
          if (newHead.x < center) newHead.x += 1;
          else if (newHead.x > center) newHead.x -= 1;
          if (newHead.y < center) newHead.y += 1;
          else if (newHead.y > center) newHead.y -= 1;
      }

      // Handle Portals
      if (portals) {
          if (newHead.x === portals.p1.x && newHead.y === portals.p1.y) {
              newHead.x = portals.p2.x; newHead.y = portals.p2.y;
          } else if (newHead.x === portals.p2.x && newHead.y === portals.p2.y) {
              newHead.x = portals.p1.x; newHead.y = portals.p1.y;
          }
      }

      // Handle Wrap Around
      if (mode.config.wrapAround) {
        if (newHead.x < 0) newHead.x = mode.config.gridSize - 1;
        if (newHead.x >= mode.config.gridSize) newHead.x = 0;
        if (newHead.y < 0) newHead.y = mode.config.gridSize - 1;
        if (newHead.y >= mode.config.gridSize) newHead.y = 0;
      } else {
        // Wall Collision
        if (newHead.x < 0 || newHead.x >= currentGridSize || newHead.y < 0 || newHead.y >= currentGridSize) {
          if (activeRules.includes('GOD_MODE')) {
              newHead.x = (newHead.x + currentGridSize) % currentGridSize;
              newHead.y = (newHead.y + currentGridSize) % currentGridSize;
          } else if (activeRules.includes('ZEN')) {
             if (newHead.x < 0) newHead.x = currentGridSize - 1;
             if (newHead.x >= currentGridSize) newHead.x = 0;
             if (newHead.y < 0) newHead.y = currentGridSize - 1;
             if (newHead.y >= currentGridSize) newHead.y = 0;
          } else if (activeRules.includes('BOUNCY')) {
              if (directionRef.current === 'UP') directionRef.current = 'DOWN';
              else if (directionRef.current === 'DOWN') directionRef.current = 'UP';
              else if (directionRef.current === 'LEFT') directionRef.current = 'RIGHT';
              else if (directionRef.current === 'RIGHT') directionRef.current = 'LEFT';
              return prevSnake;
          } else {
            if (hasShield) { setHasShield(false); return prevSnake; }
            onGameOver(scoreRef.current);
            return prevSnake;
          }
        }
      }

      // Obstacle Collision
      const isObstacle = obstaclesRef.current.some(o => o.x === newHead.x && o.y === newHead.y) ||
                         trailObstacles.some(o => o.pos.x === newHead.x && o.pos.y === newHead.y);
      
      if (isObstacle) {
          if (activeRules.includes('SOKOBAN')) {
              const dx = newHead.x - head.x;
              const dy = newHead.y - head.y;
              const nextObsPos = { x: newHead.x + dx, y: newHead.y + dy };
              
              // Check if next position is valid
              const isBlocked = nextObsPos.x < 0 || nextObsPos.x >= currentGridSize || 
                               nextObsPos.y < 0 || nextObsPos.y >= currentGridSize ||
                               obstaclesRef.current.some(o => o.x === nextObsPos.x && o.y === nextObsPos.y) ||
                               prevSnake.some(s => s.x === nextObsPos.x && s.y === nextObsPos.y);
              
              if (!isBlocked) {
                  setObstacles(prev => {
                      const obsIndex = prev.findIndex(o => o.x === newHead.x && o.y === newHead.y);
                      if (obsIndex === -1) return prev; // It was a trail obstacle, can't push
                      const next = [...prev];
                      next[obsIndex] = nextObsPos;
                      return next;
                  });
              } else {
                  if (hasShield) { setHasShield(false); return prevSnake; }
                  onGameOver(scoreRef.current);
                  return prevSnake;
              }
          } else {
              if (hasShield) { setHasShield(false); return prevSnake; }
              onGameOver(scoreRef.current);
              return prevSnake;
          }
      }

      // Mine Collision
      if (activeRules.includes('MINES') && mines.some(m => m.x === newHead.x && m.y === newHead.y)) {
          if (hasShield) { setHasShield(false); return prevSnake; }
          onGameOver(scoreRef.current);
          return prevSnake;
      }

      // Falling Floor Collision
      if (activeRules.includes('FALLING_FLOOR') && visitedTiles.some(v => v.x === newHead.x && v.y === newHead.y)) {
          onGameOver(scoreRef.current);
          return prevSnake;
      }

      // Self Collision
      if (prevSnake.some((s, i) => i !== 0 && s.x === newHead.x && s.y === newHead.y)) {
        if (activeRules.includes('GOD_MODE')) {
            // No self collision
        } else if (activeRules.includes('ELECTRIC')) {
            setIsStunned(true);
            setTimeout(() => setIsStunned(false), 2000);
            return prevSnake;
        }
        if (!activeRules.includes('GHOST') && !activeRules.includes('ZEN')) {
          if (hasShield) { setHasShield(false); return prevSnake; }
          onGameOver(scoreRef.current);
          return prevSnake;
        }
      }

      // Collision with Snake 2
      if (snake2Ref.current.some(s => s.x === newHead.x && s.y === newHead.y)) {
          if (hasShield) { setHasShield(false); return prevSnake; }
          onGameOver(scoreRef.current);
          return prevSnake;
      }

      // Clone Collision
      if (activeRules.includes('CLONE') && cloneSnake.some(s => s.x === newHead.x && s.y === newHead.y)) {
          if (hasShield) { setHasShield(false); return prevSnake; }
          onGameOver(scoreRef.current);
          return prevSnake;
      }

      // Lava Collision
      if (activeRules.includes('LAVA') && lavaTiles.some(l => l.x === newHead.x && l.y === newHead.y)) {
          if (hasShield) { setHasShield(false); return prevSnake; }
          onGameOver(scoreRef.current);
          return prevSnake;
      }

      // Boss Collision
      if (activeRules.includes('BOSS') && Math.abs(newHead.x - bossPos.x) < 2 && Math.abs(newHead.y - bossPos.y) < 2) {
          if (hasShield) { setHasShield(false); return prevSnake; }
          onGameOver(scoreRef.current);
          return prevSnake;
      }

      // Stealth Collision
      if (activeRules.includes('STEALTH')) {
          if (searchlights.some(s => Math.sqrt(Math.pow(newHead.x - s.x, 2) + Math.pow(newHead.y - s.y, 2)) < s.radius)) {
              if (hasShield) { setHasShield(false); return prevSnake; }
              onGameOver(scoreRef.current);
              return prevSnake;
          }
      }

      // Hacker Collision
      if (activeRules.includes('HACKER')) {
          const isUnlocked = unlockedGrid.some(p => p.x === newHead.x && p.y === newHead.y) || 
                             (newHead.x >= 5 && newHead.x <= 15 && newHead.y >= 5 && newHead.y <= 15);
          if (!isUnlocked) {
              if (hasShield) { setHasShield(false); return prevSnake; }
              onGameOver(scoreRef.current);
              return prevSnake;
          }
      }

      // Defender Collision
      if (activeRules.includes('DEFENDER')) {
          // Snake blocks projectiles
          setProjectiles(prev => prev.filter(p => p.x !== newHead.x || p.y !== newHead.y));
          
          // Check if any projectile reached center
          const center = Math.floor(currentGridSize / 2);
          if (projectiles.some(p => p.x === center && p.y === center)) {
              onGameOver(scoreRef.current);
              return prevSnake;
          }
      }

      // Racer Collision
      if (activeRules.includes('RACER')) {
          if (ghostSnake[0].x === foodRef.current.x && ghostSnake[0].y === foodRef.current.y) {
              onGameOver(scoreRef.current);
              return prevSnake;
          }
      }

      const newSnake = [newHead, ...prevSnake];

      if (activeRules.includes('FALLING_FLOOR')) {
          setVisitedTiles(prev => [...prev, head]);
      }

      // Food Collision
      const isEatingMain = newHead.x === foodRef.current.x && newHead.y === foodRef.current.y;
      const extraFoodIndex = extraFood.findIndex(f => f.x === newHead.x && f.y === newHead.y);
      const isEatingExtra = extraFoodIndex !== -1;

      if (isEatingMain || isEatingExtra) {
        if (activeRules.includes('SOLID_GHOST') && !isSolid) {
            // Can't eat if not solid
            newSnake.pop();
            return newSnake;
        }

        // Color Match Check
        if (activeRules.includes('COLOR_MATCH') && headColor !== '#10b981') {
            // In Color Match, food is always green, but head color must match?
            // Actually let's say food color changes to match head color sometimes.
            // For now, let's just say head must be green to eat.
            // Or better: head color changes every move, and food color changes every 5s.
        }

        // Numbers Check
        if (activeRules.includes('NUMBERS')) {
            // targetNumber is the one we want.
            // For now, let's just increment it.
            setTargetNumber(n => n + 1);
        }

        const newScore = scoreRef.current + 10;
        onScoreUpdate(newScore);
        
        if (activeRules.includes('TAIL_DROP') && newScore % 50 === 0) {
            setObstacles(prev => [...prev, prevSnake[prevSnake.length - 1]]);
        }
        
        if (activeRules.includes('EVOLUTION') && newScore % 50 === 0) {
            const allRules = ['GHOST', 'SHRINK_FOOD', 'REVERSE', 'DRUNK', 'DARK_MODE', 'RAINBOW', 'MAGNET', 'GRAVITY', 'WIND', 'BLACK_HOLE', 'ELECTRIC', 'INVISIBLE', 'FLICKER', 'QUANTUM', 'LAVA', 'GROWING_WALLS', 'SPEEDY_FOOD', 'TRAIL', 'MINES', 'GHOST_FOOD', 'TELEPORT_FOOD', 'BOUNCY', 'TAIL_DROP', 'VISION', 'COLOR_MATCH', 'NUMBERS', 'PORTAL_STORM', 'CLONE', 'SPEEDRUN', 'BATTERY'];
            const randomRule = allRules[Math.floor(Math.random() * allRules.length)];
            setActiveRules(prev => [...new Set([...prev, randomRule])]);
        }

        if (activeRules.includes('BATTERY')) {
            setEnergy(e => Math.min(100, e + 20));
        }

        if (activeRules.includes('PUZZLE')) {
            const val = Math.floor(Math.random() * 9) + 1;
            setCurrentSum(s => {
                const next = s + val;
                if (next === targetSum) {
                    onScoreUpdate(scoreRef.current + 100);
                    setTargetSum(Math.floor(Math.random() * 50) + 10);
                    return 0;
                }
                if (next > targetSum) return 0;
                return next;
            });
        }

        if (activeRules.includes('HACKER')) {
            setUnlockedGrid(prev => {
                const next = [...prev];
                for (let x = newHead.x - 2; x <= newHead.x + 2; x++) {
                    for (let y = newHead.y - 2; y <= newHead.y + 2; y++) {
                        if (x >= 0 && x < currentGridSize && y >= 0 && y < currentGridSize) {
                            if (!next.some(p => p.x === x && p.y === y)) next.push({ x, y });
                        }
                    }
                }
                return next;
            });
        }

        if (activeRules.includes('COLLECTOR')) {
            const colors = ['#ef4444', '#3b82f6', '#10b981', '#fbbf24', '#a855f7'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            setCollectedColors(prev => [...new Set([...prev, color])]);
            if (color === '#ef4444') setSpeed(s => Math.max(50, s - 10));
            if (color === '#3b82f6') setSpeed(s => s + 10);
            if (color === '#10b981') /* grow more? handled by default */ {};
            if (color === '#fbbf24') setHasShield(true);
            if (color === '#a855f7') setActiveRules(prev => [...new Set([...prev, 'GHOST'])]);
        }

        if (isEatingMain) {
            setFood(generateFood(newSnake, snake2Ref.current, obstaclesRef.current));
        } else {
            setExtraFood(prev => {
                const next = [...prev];
                next[extraFoodIndex] = generateFood(newSnake, snake2Ref.current, obstaclesRef.current);
                return next;
            });
        }
        
        if (activeRules.includes('EXPANDING') && newScore % 50 === 0) {
            setCurrentGridSize(s => Math.min(40, s + 2));
        }
        if (activeRules.includes('SHRINKING') && newScore % 50 === 0) {
            setCurrentGridSize(s => Math.max(10, s - 2));
        }

        if (activeRules.includes('DUNGEON')) {
            if ((scoreRef.current + 10) % 50 === 0) {
                setLevel(l => l + 1);
                setSpeed(s => Math.max(50, s - 20));
                setObstacles(prev => [...prev, ...generateObstacles().slice(0, 2)]);
            }
        } else if (activeRules.includes('GROWING_WALLS')) {
            setObstacles(prev => [...prev, generateFood(newSnake, snake2Ref.current, obstaclesRef.current)]);
            setSpeed(prev => Math.max(50, prev - mode.config.speedIncrement));
        } else {
            setSpeed(prev => Math.max(50, prev - mode.config.speedIncrement));
        }
        
        if (activeRules.includes('SHRINK_FOOD') && Math.random() > 0.7 && newSnake.length > 3) {
            newSnake.pop();
            newSnake.pop();
        }
      } else {
        // Check Powerups
        const puIndex = powerups.findIndex(p => p.pos.x === newHead.x && p.pos.y === newHead.y);
        if (puIndex !== -1) {
            const pu = powerups[puIndex];
            if (pu.type === 'SPEED') setSpeed(s => Math.max(50, s - 30));
            if (pu.type === 'GHOST') {
                setActiveRules(r => [...r, 'GHOST']);
                setTimeout(() => setActiveRules(r => r.filter(x => x !== 'GHOST')), 5000);
            }
            if (pu.type === 'SCORE') {
                onScoreUpdate(scoreRef.current + 50);
            }
            setPowerups(p => p.filter((_, i) => i !== puIndex));
            newSnake.pop();
        } else {
            newSnake.pop();
        }
      }

      return newSnake;
    });

    // Move Snake 2 if active
    if (activeRules.includes('2P')) {
        setSnake2(prevSnake => {
            if (prevSnake.length === 0) return prevSnake;
            const head = prevSnake[0];
            const newHead = { ...head };
            switch (direction2Ref.current) {
                case 'UP': newHead.y -= 1; break;
                case 'DOWN': newHead.y += 1; break;
                case 'LEFT': newHead.x -= 1; break;
                case 'RIGHT': newHead.x += 1; break;
            }
            if (newHead.x < 0 || newHead.x >= mode.config.gridSize || newHead.y < 0 || newHead.y >= mode.config.gridSize) {
                onGameOver(scoreRef.current); return prevSnake;
            }
            if (prevSnake.some(s => s.x === newHead.x && s.y === newHead.y) || snakeRef.current.some(s => s.x === newHead.x && s.y === newHead.y)) {
                onGameOver(scoreRef.current); return prevSnake;
            }
            const newSnake = [newHead, ...prevSnake];
            if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
                onScoreUpdate(scoreRef.current + 10);
                setFood(generateFood(snakeRef.current, newSnake, obstaclesRef.current));
            } else {
                newSnake.pop();
            }
            return newSnake;
        });
    }

    // Move Boss
    if (activeRules.includes('BOSS') && Math.random() > 0.5) {
        setBossPos(prev => {
            const head = snakeRef.current[0];
            const dx = head.x - prev.x;
            const dy = head.y - prev.y;
            return {
                x: prev.x + (dx > 0 ? 1 : dx < 0 ? -1 : 0),
                y: prev.y + (dy > 0 ? 1 : dy < 0 ? -1 : 0)
            };
        });
    }

    if (activeRules.includes('RAINBOW')) {
        setHue(h => (h + 5) % 360);
    }

    // Magnet logic
    if (activeRules.includes('MAGNET')) {
        setFood(prevFood => {
            const head = snakeRef.current[0];
            const dx = head.x - prevFood.x;
            const dy = head.y - prevFood.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 5 && dist > 0) {
                return {
                    x: prevFood.x + (dx > 0 ? 1 : dx < 0 ? -1 : 0),
                    y: prevFood.y + (dy > 0 ? 1 : dy < 0 ? -1 : 0)
                };
            }
            return prevFood;
        });
    }

    // Teleport Food
    if (activeRules.includes('TELEPORT_FOOD')) {
        setFood(prevFood => {
            const head = snakeRef.current[0];
            const dist = Math.abs(head.x - prevFood.x) + Math.abs(head.y - prevFood.y);
            if (dist < 3) {
                return generateFood(snakeRef.current, snake2Ref.current, obstaclesRef.current);
            }
            return prevFood;
        });
    }

    // Trail
    if (activeRules.includes('TRAIL')) {
        setTrailObstacles(prev => [...prev, { pos: snakeRef.current[0], expires: Date.now() + 5000 }]);
    }

    // Clone
    if (activeRules.includes('CLONE')) {
        setCloneSnake(prev => {
            const next = [snakeRef.current[0], ...prev];
            if (next.length > 10) next.pop();
            return next;
        });
    }

    // Portal Storm
    if (activeRules.includes('PORTAL_STORM')) {
        setSnake(prev => {
            const head = prev[0];
            const pIndex = extraPortals.findIndex(p => p.x === head.x && p.y === head.y);
            if (pIndex !== -1) {
                const nextP = extraPortals[(pIndex + 1) % extraPortals.length];
                const newHead = { ...nextP };
                return [newHead, ...prev.slice(1)];
            }
            return prev;
        });
    }
    // Racer
    if (activeRules.includes('RACER')) {
        setGhostSnake(prev => {
            const head = prev[0];
            const target = foodRef.current;
            const dx = target.x - head.x;
            const dy = target.y - head.y;
            const next = {
                x: head.x + (dx > 0 ? 1 : dx < 0 ? -1 : 0),
                y: head.y + (dy > 0 ? 1 : dy < 0 ? -1 : 0)
            };
            return [next, ...prev.slice(0, 4)];
        });
    }

    // Defender
    if (activeRules.includes('DEFENDER')) {
        setProjectiles(prev => prev.map(p => {
            const dx = currentGridSize/2 - p.x;
            const dy = currentGridSize/2 - p.y;
            return {
                x: p.x + (dx > 0 ? 1 : dx < 0 ? -1 : 0),
                y: p.y + (dy > 0 ? 1 : dy < 0 ? -1 : 0)
            };
        }).filter(p => Math.abs(p.x - currentGridSize/2) > 1 || Math.abs(p.y - currentGridSize/2) > 1));
    }
  }, [isPaused, mode, onGameOver, onScoreUpdate, generateFood, portals, activeRules, isStunned, powerups, lavaTiles, bossPos, hasShield, extraFood, trailObstacles, mines, currentGridSize, extraPortals, cloneSnake, projectiles, ghostSnake, targetSum, currentSum, searchlights, unlockedGrid, isSolid, headColor, targetNumber]);

  const animate = useCallback((time: number) => {
    let effectiveSpeed = speed;
    if (isDashing) effectiveSpeed /= 3;
    if (isSlowMo) effectiveSpeed *= 3;

    if (time - lastMoveTime.current > effectiveSpeed) {
      moveSnake();
      lastMoveTime.current = time;
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [speed, moveSnake, isDashing, isSlowMo]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && activeRules.includes('DASH')) setIsDashing(true);
      if (e.ctrlKey && activeRules.includes('SLOWMO')) setIsSlowMo(true);
      if (e.key.toLowerCase() === 'e' && activeRules.includes('TELEPORT') && teleportCooldown <= 0) {
          setSnake(prev => {
              const head = prev[0];
              const newHead = { ...head };
              const dist = 3;
              switch (directionRef.current) {
                  case 'UP': newHead.y -= dist; break;
                  case 'DOWN': newHead.y += dist; break;
                  case 'LEFT': newHead.x -= dist; break;
                  case 'RIGHT': newHead.x += dist; break;
              }
              // Basic bounds check
              newHead.x = Math.max(0, Math.min(mode.config.gridSize - 1, newHead.x));
              newHead.y = Math.max(0, Math.min(mode.config.gridSize - 1, newHead.y));
              
              return [newHead, ...prev.slice(0, -1)];
          });
          setTeleportCooldown(2000);
          setTimeout(() => setTeleportCooldown(0), 2000);
      }
      if (e.code === 'Space' && activeRules.includes('TAIL_CUT')) {
          setSnake(s => s.slice(0, Math.max(3, Math.floor(s.length / 2))));
          setSpeed(sp => Math.max(50, sp - 20));
      }
      if (e.code === 'Space' && activeRules.includes('SNIPER')) {
          const head = snakeRef.current[0];
          setObstacles(prev => {
              const next = [...prev];
              const target = { x: head.x, y: head.y };
              switch (directionRef.current) {
                  case 'UP': target.y -= 1; break;
                  case 'DOWN': target.y += 1; break;
                  case 'LEFT': target.x -= 1; break;
                  case 'RIGHT': target.x += 1; break;
              }
              return next.filter(o => o.x !== target.x || o.y !== target.y);
          });
      }
      if (e.code === 'Space' && activeRules.includes('BUILDER')) {
          const head = snakeRef.current[0];
          const target = { x: head.x, y: head.y };
          switch (directionRef.current) {
              case 'UP': target.y += 1; break;
              case 'DOWN': target.y -= 1; break;
              case 'LEFT': target.x += 1; break;
              case 'RIGHT': target.x -= 1; break;
          }
          setObstacles(prev => [...prev, target]);
      }
      if (e.code === 'Space' && activeRules.includes('DIMENSION')) {
          setDimension(d => {
              const nextD = d === 0 ? 1 : 0;
              setDimensionData(prev => {
                  const next = [...prev];
                  next[d] = { food: foodRef.current, obstacles: obstaclesRef.current };
                  setFood(next[nextD].food);
                  setObstacles(next[nextD].obstacles);
                  return next;
              });
              return nextD;
          });
      }
      if (e.code === 'Space' && activeRules.includes('SOLID_GHOST')) {
          setIsSolid(s => !s);
      }
      if (e.code === 'Space' && activeRules.includes('JUMPER')) {
          setSnake(prev => {
              const head = prev[0];
              let nextHead = { ...head };
              switch (directionRef.current) {
                  case 'UP': nextHead.y -= 2; break;
                  case 'DOWN': nextHead.y += 2; break;
                  case 'LEFT': nextHead.x -= 2; break;
                  case 'RIGHT': nextHead.x += 2; break;
              }
              return [nextHead, ...prev.slice(1)];
          });
      }

      let key = e.key;
      
      // Reverse Controls
      if (activeRules.includes('REVERSE')) {
          if (key === 'ArrowUp') key = 'ArrowDown';
          else if (key === 'ArrowDown') key = 'ArrowUp';
          else if (key === 'ArrowLeft') key = 'ArrowRight';
          else if (key === 'ArrowRight') key = 'ArrowLeft';
          else if (key === 'w') key = 's';
          else if (key === 's') key = 'w';
          else if (key === 'a') key = 'd';
          else if (key === 'd') key = 'a';
      }

      let newDir: Direction | null = null;
      switch (key) {
        case 'ArrowUp': if (direction2Ref.current !== 'DOWN') direction2Ref.current = 'UP'; break;
        case 'ArrowDown': if (direction2Ref.current !== 'UP') direction2Ref.current = 'DOWN'; break;
        case 'ArrowLeft': if (direction2Ref.current !== 'RIGHT') direction2Ref.current = 'LEFT'; break;
        case 'ArrowRight': if (direction2Ref.current !== 'LEFT') direction2Ref.current = 'RIGHT'; break;
        case 'w': if (directionRef.current !== 'DOWN') newDir = 'UP'; break;
        case 's': if (directionRef.current !== 'UP') newDir = 'DOWN'; break;
        case 'a': if (directionRef.current !== 'RIGHT') newDir = 'LEFT'; break;
        case 'd': if (directionRef.current !== 'LEFT') newDir = 'RIGHT'; break;
        case 'Escape': setIsPaused(p => !p); break;
      }

      if (newDir) {
          if (activeRules.includes('DRIFTER')) {
              setPendingDirection(newDir);
          } else {
              directionRef.current = newDir;
          }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'Shift') setIsDashing(false);
        if (e.key === 'Control') setIsSlowMo(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeRules, teleportCooldown, mode, onGameOver, generateFood, currentGridSize, dimension, isSolid, dimensionData]);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width / currentGridSize;

    // Clear
    ctx.fillStyle = '#171717';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = '#262626';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= currentGridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * size, 0); ctx.lineTo(i * size, canvas.height); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * size); ctx.lineTo(canvas.width, i * size); ctx.stroke();
    }

    // Obstacles
    obstacles.forEach(o => {
        ctx.fillStyle = activeRules.includes('SOKOBAN') ? '#d97706' : '#404040';
        ctx.fillRect(o.x * size + 2, o.y * size + 2, size - 4, size - 4);
    });

    // Trail Obstacles
    trailObstacles.forEach(o => {
        if (o.expires < Date.now()) return;
        ctx.fillStyle = 'rgba(115, 115, 115, 0.5)';
        ctx.fillRect(o.pos.x * size + 2, o.pos.y * size + 2, size - 4, size - 4);
    });

    // Mines
    mines.forEach(m => {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(m.x * size + 2, m.y * size + 2, size - 4, size - 4);
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(m.x * size + size/2, m.y * size + size/2, size/6, 0, Math.PI*2);
        ctx.fill();
    });

    // Falling Floor
    if (activeRules.includes('FALLING_FLOOR')) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        visitedTiles.forEach(v => {
            ctx.fillRect(v.x * size, v.y * size, size, size);
        });
    }

    // Lava
    if (activeRules.includes('LAVA')) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
        lavaTiles.forEach(l => {
            ctx.fillRect(l.x * size, l.y * size, size, size);
        });
    }

    // Portals
    if (portals) {
        ctx.fillStyle = '#3b82f6'; // Blue
        ctx.shadowBlur = 10; ctx.shadowColor = '#3b82f6';
        ctx.beginPath(); ctx.arc(portals.p1.x * size + size/2, portals.p1.y * size + size/2, size/2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#f97316'; // Orange
        ctx.shadowBlur = 10; ctx.shadowColor = '#f97316';
        ctx.beginPath(); ctx.arc(portals.p2.x * size + size/2, portals.p2.y * size + size/2, size/2, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
    }

    // Extra Portals
    extraPortals.forEach((p, i) => {
        ctx.fillStyle = i % 2 === 0 ? '#3b82f6' : '#f97316';
        ctx.shadowBlur = 5; ctx.shadowColor = ctx.fillStyle;
        ctx.beginPath(); ctx.arc(p.x * size + size/2, p.y * size + size/2, size/2, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Hacker Grid
    if (activeRules.includes('HACKER')) {
        ctx.fillStyle = 'rgba(8, 145, 178, 0.1)';
        unlockedGrid.forEach(p => {
            ctx.fillRect(p.x * size, p.y * size, size, size);
        });
        // Safe starting zone
        ctx.fillStyle = 'rgba(8, 145, 178, 0.2)';
        ctx.fillRect(5 * size, 5 * size, 11 * size, 11 * size);
    }

    // Defender
    if (activeRules.includes('DEFENDER')) {
        const center = Math.floor(currentGridSize / 2);
        ctx.fillStyle = '#ef4444';
        ctx.shadowBlur = 15; ctx.shadowColor = '#ef4444';
        ctx.fillRect(center * size, center * size, size, size);
        ctx.shadowBlur = 0;
        
        projectiles.forEach(p => {
            ctx.fillStyle = '#f87171';
            ctx.beginPath();
            ctx.arc(p.x * size + size/2, p.y * size + size/2, size/3, 0, Math.PI*2);
            ctx.fill();
        });
    }

    // Racer
    if (activeRules.includes('RACER')) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ghostSnake.forEach(p => {
            ctx.fillRect(p.x * size + 2, p.y * size + 2, size - 4, size - 4);
        });
    }

    // Stealth
    if (activeRules.includes('STEALTH')) {
        searchlights.forEach(s => {
            const grad = ctx.createRadialGradient(
                s.x * size + size/2, s.y * size + size/2, 0,
                s.x * size + size/2, s.y * size + size/2, s.radius * size
            );
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(s.x * size + size/2, s.y * size + size/2, s.radius * size, 0, Math.PI*2);
            ctx.fill();
        });
    }

    // Powerups
    powerups.forEach(pu => {
        if (pu.expires < Date.now()) return;
        ctx.fillStyle = pu.type === 'SPEED' ? '#fbbf24' : pu.type === 'GHOST' ? '#a855f7' : '#ec4899';
        ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle;
        ctx.fillRect(pu.pos.x * size + 4, pu.pos.y * size + 4, size - 8, size - 8);
        ctx.shadowBlur = 0;
    });

    // Food
    ctx.fillStyle = '#10b981';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#10b981';
    
    const foods = [food, ...extraFood];
    foods.forEach((f, i) => {
        if (activeRules.includes('GHOST_FOOD') && Math.floor(Date.now() / 500) % 4 !== 0) return;
        ctx.beginPath();
        ctx.arc(f.x * size + size / 2, f.y * size + size / 2, size / 2.5, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.shadowBlur = 0;

    // Snake
    snake.forEach((part, i) => {
      const isHead = i === 0;
      
      if (activeRules.includes('RAINBOW')) {
          ctx.fillStyle = `hsl(${(hue + i * 10) % 360}, 70%, 50%)`;
      } else if (activeRules.includes('COLOR_MATCH')) {
          ctx.fillStyle = isHead ? headColor : '#059669';
      } else {
          ctx.fillStyle = isHead ? '#34d399' : '#059669';
      }
      
      if (activeRules.includes('DARK_MODE')) {
          const head = snake[0];
          const dist = Math.sqrt(Math.pow(part.x - head.x, 2) + Math.pow(part.y - head.y, 2));
          if (dist > 3) ctx.globalAlpha = 0;
          else ctx.globalAlpha = 1 - (dist / 4);
      }

      if (activeRules.includes('VISION')) {
          const head = snake[0];
          const dist = Math.sqrt(Math.pow(part.x - head.x, 2) + Math.pow(part.y - head.y, 2));
          if (dist > 2) ctx.globalAlpha = 0;
          else ctx.globalAlpha = 1 - (dist / 3);
      }

      if (activeRules.includes('INVISIBLE')) {
          if (i !== 0 && i !== snake.length - 1) ctx.globalAlpha = 0;
      }

      if (activeRules.includes('FLICKER')) {
          if (Math.floor(Date.now() / 200) % 2 === 0) ctx.globalAlpha = 0;
      }

      if (activeRules.includes('NUMBERS')) {
          ctx.fillStyle = '#fff';
          ctx.font = `${size/2}px monospace`;
          ctx.fillText(targetNumber.toString(), part.x * size + size/4, part.y * size + size*0.75);
      }

      if (activeRules.includes('ASCII')) {
          ctx.font = `${size}px monospace`;
          ctx.fillText(isHead ? '@' : '#', part.x * size, part.y * size + size);
      } else if (activeRules.includes('BALL')) {
          ctx.beginPath();
          ctx.arc(part.x * size + size/2, part.y * size + size/2, size/2 - 1, 0, Math.PI*2);
          ctx.fill();
      } else {
          const padding = 1;
          ctx.fillRect(part.x * size + padding, part.y * size + padding, size - padding * 2, size - padding * 2);
      }
      
      if (isHead && !activeRules.includes('ASCII')) {
        if (hasShield) {
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(part.x * size + size/2, part.y * size + size/2, size/2 + 2, 0, Math.PI*2);
            ctx.stroke();
        }
        ctx.fillStyle = '#000';
        const eyeSize = size / 6;
        if (directionRef.current === 'RIGHT' || directionRef.current === 'LEFT') {
            ctx.fillRect(part.x * size + size/2, part.y * size + size/4, eyeSize, eyeSize);
            ctx.fillRect(part.x * size + size/2, part.y * size + size*0.75 - eyeSize, eyeSize, eyeSize);
        } else {
            ctx.fillRect(part.x * size + size/4, part.y * size + size/2, eyeSize, eyeSize);
            ctx.fillRect(part.x * size + size*0.75 - eyeSize, part.y * size + size/2, eyeSize, eyeSize);
        }
      }
      ctx.globalAlpha = 1;
    });

    // Snake 2
    snake2.forEach((part, i) => {
        ctx.fillStyle = i === 0 ? '#f87171' : '#dc2626';
        ctx.fillRect(part.x * size + 1, part.y * size + 1, size - 2, size - 2);
    });

    // Boss
    if (activeRules.includes('BOSS')) {
        ctx.fillStyle = 'rgba(126, 34, 206, 0.6)';
        ctx.shadowBlur = 20; ctx.shadowColor = '#7e22ce';
        ctx.fillRect(bossPos.x * size - size/2, bossPos.y * size - size/2, size * 2, size * 2);
        ctx.shadowBlur = 0;
    }

    // Dark Mode Mask
    if (activeRules.includes('DARK_MODE')) {
        const head = snake[0];
        const gradient = ctx.createRadialGradient(
            head.x * size + size/2, head.y * size + size/2, size,
            head.x * size + size/2, head.y * size + size/2, size * 5
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.95)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (isPaused) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }

    if (activeRules.includes('BATTERY')) {
        ctx.fillStyle = '#404040';
        ctx.fillRect(10, 10, 100, 10);
        ctx.fillStyle = energy > 30 ? '#fbbf24' : '#ef4444';
        ctx.fillRect(10, 10, energy, 10);
    }

    if (activeRules.includes('SOLID_GHOST')) {
        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.fillText(isSolid ? 'SOLID' : 'GHOST', 10, 30);
    }

    if (activeRules.includes('DIMENSION')) {
        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.fillText(`DIMENSION ${dimension + 1}`, 10, 40);
    }

    if (activeRules.includes('PUZZLE')) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`SUM: ${currentSum} / ${targetSum}`, 10, 55);
    }
  }, [snake, food, mode, isPaused, obstacles, hue, snake2, bossPos, currentGridSize, extraFood, trailObstacles, mines, hasShield, headColor, targetNumber, extraPortals, cloneSnake, activeRules, visitedTiles, lavaTiles, powerups, portals, timeLeft, level, energy, dimension, isSolid, projectiles, ghostSnake, targetSum, currentSum, searchlights, unlockedGrid]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="mb-4 flex justify-between w-full max-w-[500px] items-end">
        <div>
          <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Current Mode</p>
          <h3 className="text-xl font-bold flex items-center gap-2">
            {mode.icon} {mode.name}
          </h3>
          {activeRules.length > 0 && activeRules[0] !== mode.config.specialRules?.[0] && (
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">
              Active Rule: {activeRules[0].replace('_', ' ')}
            </p>
          )}
          {mode.config.specialRules?.includes('TIME_ATTACK') && (
              <p className="text-lg font-mono font-bold text-yellow-500">Time: {timeLeft}s</p>
          )}
          {activeRules.includes('DUNGEON') && (
              <p className="text-lg font-mono font-bold text-red-500">Level: {level}</p>
          )}
          {activeRules.includes('TELEPORT') && (
              <p className={`text-xs font-bold ${teleportCooldown > 0 ? 'text-neutral-500' : 'text-cyan-400 animate-pulse'}`}>
                Teleport: {teleportCooldown > 0 ? 'Charging...' : 'READY (E)'}
              </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Score</p>
          <p className="text-3xl font-mono font-black text-emerald-400">{score}</p>
        </div>
      </div>
      <div className="relative border-4 border-neutral-800 rounded-xl overflow-hidden bg-neutral-900 shadow-2xl">
        <canvas 
          ref={canvasRef} 
          width={500} 
          height={500}
          className="max-w-full h-auto"
          style={{ 
              imageRendering: 'pixelated',
              transform: activeRules.includes('MIRROR') ? 'scaleX(-1)' : 'none'
          }}
        />
      </div>
    </div>
  );
}
