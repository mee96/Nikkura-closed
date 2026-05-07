import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
  output,
} from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
  readonly scrolled = output<void>();

  private readonly el = inject(ElementRef<HTMLElement>);
  private observer!: IntersectionObserver;

  ngOnInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) this.scrolled.emit();
      },
      { threshold: 0.1 },
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
  }
}
