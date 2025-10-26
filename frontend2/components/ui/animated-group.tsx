'use client';

import { cn } from '@/lib/utils';
import {
    AnimatePresence,
    motion,
    TargetAndTransition,
    Variants,
} from 'framer-motion';
import React, { useState, useEffect } from 'react';

type PresetType = 'blur' | 'shake' | 'scale' | 'fade' | 'slide';

type TextEffectProps = {
    children: string;
    per?: 'word' | 'char' | 'line';
    as?: keyof React.JSX.IntrinsicElements;
    variants?: {
        container?: Variants;
        item?: Variants;
    };
    className?: string;
    preset?: PresetType;
    delay?: number;
    trigger?: boolean;
    onAnimationComplete?: () => void;
    segmentWrapperClassName?: string;
};

const defaultStaggerTimes: Record<'char' | 'word' | 'line', number> = {
    char: 0.03,
    word: 0.05,
    line: 0.1,
};

const defaultContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
    exit: {
        transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
};

const defaultItemVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
    },
    exit: { opacity: 0 },
};

const presetVariants: Record<
    PresetType,
    { container: Variants; item: Variants }
> = {
    blur: {
        container: defaultContainerVariants,
        item: {
            hidden: { opacity: 0, filter: 'blur(12px)' },
            visible: { opacity: 1, filter: 'blur(0px)' },
            exit: { opacity: 0, filter: 'blur(12px)' },
        },
    },
    shake: {
        container: defaultContainerVariants,
        item: {
            hidden: { x: 0 },
            visible: { x: [-5, 5, -5, 5, 0], transition: { duration: 0.5 } },
            exit: { x: 0 },
        },
    },
    scale: {
        container: defaultContainerVariants,
        item: {
            hidden: { opacity: 0, scale: 0 },
            visible: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0 },
        },
    },
    fade: {
        container: defaultContainerVariants,
        item: {
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
            exit: { opacity: 0 },
        },
    },
    slide: {
        container: defaultContainerVariants,
        item: {
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: 20 },
        },
    },
};

const AnimationComponent: React.FC<{
    segment: string;
    variants: Variants;
    per: 'line' | 'word' | 'char';
    segmentWrapperClassName?: string;
}> = React.memo(({ segment, variants, per, segmentWrapperClassName }) => {
    const content =
        per === 'line' ? (
            <motion.span variants={variants} className='block'>
                {segment}
            </motion.span>
        ) : per === 'word' ? (
            <motion.span
                aria-hidden='true'
                variants={variants}
                className='inline-block whitespace-pre'
            >
                {segment}
            </motion.span>
        ) : (
            <motion.span className='inline-block whitespace-pre'>
                {segment.split('').map((char, charIndex) => (
                    <motion.span
                        key={`char-${charIndex}`}
                        aria-hidden='true'
                        variants={variants}
                        className='inline-block whitespace-pre'
                    >
                        {char}
                    </motion.span>
                ))}
            </motion.span>
        );

    if (!segmentWrapperClassName) {
        return content;
    }

    const defaultWrapperClassName = per === 'line' ? 'block' : 'inline-block';

    return (
        <span className={cn(defaultWrapperClassName, segmentWrapperClassName)}>
            {content}
        </span>
    );
});

AnimationComponent.displayName = 'AnimationComponent';

export function TextEffect({
    children,
    per = 'word',
    as = 'p',
    variants,
    className,
    preset,
    delay = 0,
    trigger = true,
    onAnimationComplete,
    segmentWrapperClassName,
}: TextEffectProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [segments, setSegments] = useState<string[]>([]);

    useEffect(() => {
        // Check if children is a string before splitting
        if (typeof children === 'string') {
            if (per === 'line') {
                setSegments(children.split('\n'));
            } else if (per === 'word') {
                setSegments(children.split(/(\s+)/));
            } else {
                setSegments(children.split(''));
            }
        } else {
            // If children is not a string (React elements), just set it as a single segment
            setSegments(['']);
        }
    }, [children, per]);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    // If children is not a string, render it normally without animation
    if (typeof children !== 'string') {
        return <div className={className}>{children}</div>;
    }

    const selectedVariants = presetVariants[preset];
    const containerVariants = variants?.container || selectedVariants.container;
    const itemVariants = variants?.item || selectedVariants.item;
    const ariaLabel = per === 'line' ? undefined : children;

    const stagger = defaultStaggerTimes[per];

    const delayedContainerVariants: Variants = {
        hidden: containerVariants.hidden,
        visible: {
            ...containerVariants.visible,
            transition: {
                ...(containerVariants.visible as TargetAndTransition)?.transition,
                staggerChildren:
                    (containerVariants.visible as TargetAndTransition)?.transition
                        ?.staggerChildren || stagger,
                delayChildren: delay,
            },
        },
        exit: containerVariants.exit,
    };

    return (
        <AnimatePresence mode='popLayout'>
            {trigger && (
                <motion.div
                    initial='hidden'
                    animate={isVisible ? 'visible' : 'hidden'}
                    exit='exit'
                    aria-label={ariaLabel}
                    variants={delayedContainerVariants}
                    className={cn('whitespace-pre-wrap', className)}
                    onAnimationComplete={onAnimationComplete}
                >
                    {segments.map((segment, index) => (
                        <AnimationComponent
                            key={`${per}-${index}-${segment}`}
                            segment={segment}
                            variants={itemVariants}
                            per={per}
                            segmentWrapperClassName={segmentWrapperClassName}
                        />
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

type PresetTypeGroup =
    | 'fade'
    | 'slide'
    | 'scale'
    | 'blur'
    | 'blur-slide'
    | 'zoom'
    | 'flip'
    | 'bounce'
    | 'rotate'
    | 'swing';

type AnimatedGroupProps = {
    children: React.ReactNode;
    className?: string;
    variants?: {
        container?: Variants;
        item?: Variants;
    };
    preset?: PresetTypeGroup;
};

const defaultContainerVariantsGroup: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const defaultItemVariantsGroup: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const presetVariantsGroup: Record<
    PresetTypeGroup,
    { container: Variants; item: Variants }
> = {
    fade: {
        container: defaultContainerVariantsGroup,
        item: {
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 1 } },
        },
    },
    slide: {
        container: defaultContainerVariantsGroup,
        item: {
            hidden: { opacity: 0, y: 100 },
            visible: { opacity: 1, y: 0, transition: { duration: 1, type: "spring", bounce: 0.3 } },
        },
    },
    scale: {
        container: defaultContainerVariantsGroup,
        item: {
            hidden: { opacity: 0, scale: 0.3 },
            visible: { opacity: 1, scale: 1, transition: { duration: 1, type: "spring", bounce: 0.3 } },
        },
    },
    blur: {
        container: defaultContainerVariantsGroup,
        item: {
            hidden: { opacity: 0, filter: 'blur(20px)' },
            visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 1 } },
        },
    },
    'blur-slide': {
        container: defaultContainerVariantsGroup,
        item: {
            hidden: { opacity: 0, filter: 'blur(20px)', y: 100 },
            visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 1, type: "spring", bounce: 0.3 } },
        },
    },
    zoom: {
        container: defaultContainerVariantsGroup,
        item: {
            hidden: { opacity: 0, scale: 0.1 },
            visible: {
                opacity: 1,
                scale: 1,
                transition: { duration: 1.5, type: 'spring', stiffness: 200, damping: 20 },
            },
        },
    },
    flip: {
        container: defaultContainerVariantsGroup,
        item: {
            hidden: { opacity: 0, rotateX: -90 },
            visible: {
                opacity: 1,
                rotateX: 0,
                transition: { duration: 1, type: 'spring', stiffness: 300, damping: 20 },
            },
        },
    },
    bounce: {
        container: defaultContainerVariantsGroup,
        item: {
            hidden: { opacity: 0, y: -100 },
            visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 1.2, type: 'spring', stiffness: 400, damping: 10 },
            },
        },
    },
    rotate: {
        container: defaultContainerVariantsGroup,
        item: {
            hidden: { opacity: 0, rotate: -180 },
            visible: {
                opacity: 1,
                rotate: 0,
                transition: { duration: 1, type: 'spring', stiffness: 200, damping: 15 },
            },
        },
    },
    swing: {
        container: defaultContainerVariantsGroup,
        item: {
            hidden: { opacity: 0, rotate: -30 },
            visible: {
                opacity: 1,
                rotate: 0,
                transition: { duration: 1, type: 'spring', stiffness: 300, damping: 8 },
            },
        },
    },
};

function AnimatedGroup({
    children,
    className,
    variants,
    preset,
}: AnimatedGroupProps) {
    const selectedVariants = preset
        ? presetVariantsGroup[preset]
        : { container: defaultContainerVariantsGroup, item: defaultItemVariantsGroup };
    const containerVariants = variants?.container || selectedVariants.container;
    const itemVariants = variants?.item || selectedVariants.item;

    return (
        <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className={cn(className)}
        >
            {React.Children.map(children, (child, index) => (
                <motion.div key={index} variants={itemVariants}>
                    {child}
                </motion.div>
            ))}
        </motion.div>
    );
}

export { AnimatedGroup };
