"use client";

import { useEffect, useLayoutEffect, useRef, type CSSProperties, type KeyboardEvent, type RefObject, type SyntheticEvent } from "react";
import { Button, CloseButton, IconButton } from "@/components/winter/classic";
import { ArrowLeft, ArrowRight } from "@/components/winter/ui";
import { photoSet, type Act, type RosterDay } from "./acts";
import { originOf, popClose, popOpen } from "./popout";

interface BioDialogProps {
  id: string;
  act: Act;
  day: RosterDay;
  open: boolean;
  /** The element that opened the panel (a card or a lineup name): it pops out of it, folds back into it,
   *  and gets focus back. */
  anchorRef: RefObject<HTMLElement | null>;
  /** "Industry City, Brooklyn" (from the server, so winter.ts never ships to the client). */
  venue: string;
  reduced: boolean;
  onClose: () => void;
  onStep: (dir: -1 | 1) => void;
}

const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

/**
 * The bio: a modal <dialog> (focus trapped, page inert, Esc) over a dark scrim. A panel in the September
 * site's modal shape: the photo beside the text (above it on phones), a bar with the act's place in the
 * day, previous / next (outline squares) and the kit's red Close square, then the name, the bio, what is known for certain (date, venue, set
 * time) and the socials. An act with a clip plays it over the photo while the panel is open (BioClip).
 * It pops out of the element that opened it (popout.ts); the phase is a data attribute (no React
 * renders). Reduced motion: it simply appears and goes, and the photo stays still.
 */
export function BioDialog({ id, act, day, open, anchorRef, venue, reduced, onClose, onStep }: BioDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const anims = useRef<Animation[]>([]);
  // Latest values for the effects and native listeners below.
  const live = useRef({ open, reduced, onClose });
  useLayoutEffect(() => {
    live.current = { open, reduced, onClose };
  });

  const { artist } = act;
  const titleId = `${id}-name`;
  const photo = photoSet(artist);
  const socials = artist.socials ?? [];
  // What every act's panel can say for certain: the date, the venue, and that set times are not out yet.
  const facts = [
    { label: "Date", value: day.date },
    { label: "Venue", value: venue },
    { label: "Set time", value: "To be announced" },
  ];

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const bg = bgRef.current;
    const content = contentRef.current;
    if (!dialog || !bg || !content) return;
    const parts = { bg, content };
    const settle = (list: Animation[], then: () => void) =>
      Promise.all(list.map((a) => a.finished))
        .then(then)
        .catch(() => {});

    if (open) {
      if (dialog.open) return;
      // Set before showModal, so the very first painted frame is already the pop-out's first frame.
      dialog.dataset.phase = "opening";
      document.documentElement.classList.add("rs-lock");
      dialog.showModal();
      closeRef.current?.focus({ preventScroll: true });
      if (live.current.reduced) {
        dialog.dataset.phase = "open";
        return;
      }
      const list = popOpen(parts, originOf(anchorRef.current));
      anims.current = list;
      settle(list, () => {
        if (dialog.dataset.phase !== "opening") return;
        dialog.dataset.phase = "open";
        list.forEach((a) => a.cancel());
      });
    } else if (dialog.open) {
      if (live.current.reduced) {
        dialog.close();
        return;
      }
      dialog.dataset.phase = "closing";
      const list = popClose(parts, originOf(anchorRef.current), anims.current);
      anims.current = list;
      settle(list, () => dialog.dataset.phase === "closing" && dialog.close());
    }
  }, [open, anchorRef]);

  // Native events: Esc plays the fold instead of the instant close; any close (ours or forced) cleans up.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      live.current.onClose();
    };
    const onClosed = () => {
      anims.current.forEach((a) => a.cancel());
      anims.current = [];
      dialog.dataset.phase = "closed";
      document.documentElement.classList.remove("rs-lock");
      if (live.current.open) live.current.onClose();
      anchorRef.current?.focus({ preventScroll: true });
    };
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("close", onClosed);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onClosed);
      document.documentElement.classList.remove("rs-lock");
    };
  }, [anchorRef]);

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      onStep(e.key === "ArrowLeft" ? -1 : 1);
      return;
    }
    // Tab cycles through the panel's controls. A native modal would let focus out to the browser's own
    // controls, and Safari's default sequence skips buttons; this order is the same everywhere.
    if (e.key !== "Tab") return;
    const nodes = [...e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.getClientRects().length);
    if (!nodes.length) return;
    e.preventDefault();
    const at = nodes.indexOf(document.activeElement as HTMLElement);
    const next = at < 0 ? (e.shiftKey ? nodes.length - 1 : 0) : (at + (e.shiftKey ? -1 : 1) + nodes.length) % nodes.length;
    nodes[next].focus();
  };

  return (
    <dialog ref={dialogRef} id={id} className="rs-dialog" data-phase="closed" aria-labelledby={titleId} onKeyDown={onKeyDown}>
      <div className="rs-scrim" aria-hidden="true" onClick={onClose} />
      <div className="rs-panel" data-photo={photo ? "" : undefined}>
        <div ref={bgRef} className="rs-panel__bg" aria-hidden="true" />
        <div ref={contentRef} className="rs-panel__content">
          <div className="rs-bar">
            <p className="k-label rs-count" aria-live="polite">
              <span className="w-sr-only">{artist.name}, </span>
              <span className="rs-count__day">{day.label}</span>
              <span className="rs-count__n">
                {act.index} / {act.total}
              </span>
            </p>
            <div className="rs-ctrls">
              <IconButton variant="outline" label="Previous artist" icon={<ArrowLeft size={20} />} onClick={() => onStep(-1)} />
              <IconButton variant="outline" label="Next artist" icon={<ArrowRight size={20} />} onClick={() => onStep(1)} data-roster-next="" />
              <CloseButton ref={closeRef} label="Close bio" onClick={onClose} />
            </div>
          </div>

          <div className="rs-body">
            {photo && (
              <div key={`photo-${artist.slug}`} className="rs-photo" style={{ "--focus": artist.focus } as CSSProperties}>
                {/* The frame is taller than it is wide (4:5 on phones, the panel's height beside the text), so a
                    square photo covers it at its height: 125vw / 640px. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} srcSet={photo.srcSet} sizes="(min-width: 768px) 640px, 125vw" alt={artist.name} decoding="async" />
                {artist.clip && !reduced && (
                  <BioClip src={artist.clip} poster={artist.clipPoster} focus={artist.splashFocus} play={open} />
                )}
              </div>
            )}
            <div key={artist.slug} className="rs-text">
              <h3 id={titleId} className="rs-name">
                {artist.name}
              </h3>
              <div className="k-head__rule" aria-hidden="true" />
              {artist.bio ? (
                <div className="rs-bio" tabIndex={0} aria-label={`${artist.name} bio`}>
                  <p className="k-body">{artist.bio}</p>
                </div>
              ) : (
                <p className="k-body rs-tba">Bio to be announced</p>
              )}
              <dl className="rs-facts">
                {facts.map((f) => (
                  <div key={f.label} className="rs-fact">
                    <dt className="k-label">{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
              {socials.length > 0 && (
                <ul className="rs-socials">
                  {socials.map((s) => (
                    <li key={s.url}>
                      <Button variant="secondary" size="sm" href={s.url} external meta={s.handle}>
                        {s.platform}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}

interface BioClipProps {
  src: string;
  poster: string | null;
  /** object-position of the clip in the photo box (winter.ts splashFocus); default in roster.css. */
  focus?: string;
  /** The panel is open: play; closed: pause. */
  play: boolean;
}

/**
 * The act's clip over its photo in the bio: muted, inline, looped, playing while the panel is open (not
 * rendered under reduced motion). It stays transparent until it is actually playing, so the photo shows
 * while it loads, and stays if play() is refused (iOS Low Power Mode, data saver). Roster commits the
 * opening tap synchronously (flushSync), so this play() runs inside the tap and counts as user-started.
 * Unloaded on unmount (another act, or the roster leaving the page).
 */
function BioClip({ src, poster, focus, play }: BioClipProps) {
  const ref = useRef<HTMLVideoElement>(null);
  // First (layout effects run in order): the source is (re)attached before play() below. Unmount unloads it;
  // a remount of the same element (React's dev double-run) puts it back.
  useLayoutEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (!v.getAttribute("src")) v.setAttribute("src", src);
    return () => {
      v.pause();
      v.removeAttribute("src");
      v.load();
    };
  }, [src]);
  useLayoutEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (play) v.play()?.catch(() => {});
    else v.pause();
  }, [play, src]);
  const off = (e: SyntheticEvent<HTMLVideoElement>) => e.currentTarget.removeAttribute("data-playing");
  return (
    <video
      ref={ref}
      className="rs-photo__clip"
      style={focus ? ({ "--clip-focus": focus } as CSSProperties) : undefined}
      src={src}
      poster={poster ?? undefined}
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
      tabIndex={-1}
      aria-hidden="true"
      onPlaying={(e) => e.currentTarget.setAttribute("data-playing", "")}
      onPause={off}
      onEmptied={off}
      onError={off}
    />
  );
}
