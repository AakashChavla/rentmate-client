export class TestIntersectionObserver implements IntersectionObserver {
  public readonly root = null;
  public readonly rootMargin = '0px';
  public readonly scrollMargin = '0px';
  public readonly thresholds = [0];
  private readonly targets = new Set<Element>();
  public constructor(private readonly callback: IntersectionObserverCallback) {}
  public observe(target: Element): void {
    this.targets.add(target);
    const rect = target.getBoundingClientRect();
    queueMicrotask(() => {
      if (this.targets.has(target))
        this.callback(
          [
            {
              target,
              isIntersecting: true,
              intersectionRatio: 1,
              rootBounds: null,
              boundingClientRect: rect,
              intersectionRect: rect,
              time: 0,
            },
          ],
          this,
        );
    });
  }
  public unobserve(target: Element): void {
    this.targets.delete(target);
  }
  public disconnect(): void {
    this.targets.clear();
  }
  public takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
