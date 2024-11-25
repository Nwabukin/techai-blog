import type { SearchResult } from '../utils/search';
import { searchPosts } from '../utils/search';

interface IconHtml {
  category: string;
  tag: string;
}

class SearchManager {
  private dialog: HTMLElement;
  private input: HTMLInputElement;
  private results: HTMLElement;
  private closeButton: HTMLElement;
  private loadingIndicator: HTMLElement;
  private iconHtml: IconHtml;

  private searchTimeout: number = 0;
  private selectedIndex: number = -1;
  private searchResults: SearchResult[] = [];

  constructor(
    elements: {
      dialog: HTMLElement;
      input: HTMLInputElement;
      results: HTMLElement;
      closeButton: HTMLElement;
      loadingIndicator: HTMLElement;
    },
    iconHtml: IconHtml
  ) {
    this.dialog = elements.dialog;
    this.input = elements.input;
    this.results = elements.results;
    this.closeButton = elements.closeButton;
    this.loadingIndicator = elements.loadingIndicator;
    this.iconHtml = iconHtml;

    this.initializeEventListeners();
  }

  private initializeEventListeners() {
    this.input.addEventListener('input', this.handleInput.bind(this));
    this.closeButton.addEventListener('click', this.closeSearch.bind(this));
    document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    document.addEventListener('keydown', this.handleGlobalShortcuts.bind(this));
  }

  private showLoading() {
    this.loadingIndicator.classList.remove('hidden');
  }

  private hideLoading() {
    this.loadingIndicator.classList.add('hidden');
  }

  private async handleInput() {
    clearTimeout(this.searchTimeout);
    const query = this.input.value.trim();

    if (!query) {
      this.results.innerHTML = `
        <div class="py-14 px-6 text-center text-sm text-secondary-600 dark:text-secondary-400">
          <p>Start typing to search...</p>
        </div>
      `;
      return;
    }

    this.showLoading();
    this.searchTimeout = setTimeout(async () => {
      try {
        this.searchResults = await searchPosts(query);
        this.renderResults();
      } catch (error) {
        console.error('Search error:', error);
        this.results.innerHTML = `
          <div class="py-14 px-6 text-center text-sm text-secondary-600 dark:text-secondary-400">
            <p>An error occurred while searching. Please try again.</p>
          </div>
        `;
      } finally {
        this.hideLoading();
        this.selectedIndex = -1;
      }
    }, 300);
  }

  private renderResults() {
    if (this.searchResults.length === 0) {
      this.results.innerHTML = `
        <div class="py-14 px-6 text-center text-sm text-secondary-600 dark:text-secondary-400">
          <p>No results found.</p>
        </div>
      `;
      return;
    }

    this.results.innerHTML = this.searchResults
      .map(
        (result, index) => `
          <a
            href="/blog/${result.slug}"
            class="block px-4 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors ${
              index === this.selectedIndex ? 'bg-secondary-50 dark:bg-secondary-700/50' : ''
            }"
            data-index="${index}"
          >
            <div class="flex items-center justify-between gap-4 mb-1">
              <h3 class="text-sm font-medium text-secondary-900 dark:text-white">
                ${result.title}
              </h3>
              <div class="flex items-center gap-2 text-xs text-secondary-500 dark:text-secondary-400">
                <span class="flex items-center gap-1">
                  ${this.iconHtml.category}
                  ${result.category}
                </span>
              </div>
            </div>
            <p class="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2">
              ${result.description}
            </p>
            <div class="mt-2 flex items-center gap-3 text-xs text-secondary-500 dark:text-secondary-400">
              <span class="flex items-center gap-1">
                ${this.iconHtml.tag}
                ${result.tags.slice(0, 3).join(', ')}
              </span>
            </div>
          </a>
        `
      )
      .join('');
  }

  private updateSelection() {
    const items = this.results.querySelectorAll('a');
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('bg-secondary-50', 'dark:bg-secondary-700/50');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('bg-secondary-50', 'dark:bg-secondary-700/50');
      }
    });
  }

  private openSearch() {
    this.dialog.classList.remove('hidden');
    this.dialog.classList.add('block');
    this.input.focus();
  }

  private closeSearch() {
    this.dialog.classList.remove('block');
    this.dialog.classList.add('hidden');
    this.input.value = '';
    this.results.innerHTML = '';
    this.selectedIndex = -1;
    this.searchResults = [];
  }

  private handleKeyboardNavigation(e: KeyboardEvent) {
    if (!this.dialog.classList.contains('block')) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.searchResults.length - 1);
        this.updateSelection();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.updateSelection();
        break;
      case 'Enter':
        e.preventDefault();
        if (this.selectedIndex >= 0) {
          const selectedResult = this.searchResults[this.selectedIndex];
          window.location.href = `/blog/${selectedResult.slug}`;
        }
        break;
      case 'Escape':
        this.closeSearch();
        break;
    }
  }

  private handleGlobalShortcuts(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      this.openSearch();
    }
  }
}

export function initializeSearch(iconHtml: IconHtml) {
  const dialog = document.getElementById('search-dialog');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const closeButton = document.getElementById('close-search');
  const loadingIndicator = document.getElementById('search-loading');

  if (!dialog || !input || !results || !closeButton || !loadingIndicator) {
    console.error('Required search elements not found');
    return;
  }

  new SearchManager(
    {
      dialog: dialog as HTMLElement,
      input: input as HTMLInputElement,
      results: results as HTMLElement,
      closeButton: closeButton as HTMLElement,
      loadingIndicator: loadingIndicator as HTMLElement,
    },
    iconHtml
  );
}
