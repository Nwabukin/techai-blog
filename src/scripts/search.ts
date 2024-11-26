import type { SearchIndexItem } from '../utils/searchIndex';
import { searchPosts } from '../utils/searchIndex';

// Base class for common search functionality
abstract class BaseSearchManager {
  protected input: HTMLInputElement;
  protected results: HTMLElement;
  protected searchTimeout: number = 0;
  protected selectedIndex: number = -1;
  protected searchResults: SearchIndexItem[] = [];

  constructor(elements: { input: HTMLInputElement; results: HTMLElement }) {
    this.input = elements.input;
    this.results = elements.results;
    this.initializeEventListeners();
  }

  protected abstract initializeEventListeners(): void;
  protected abstract renderResults(): void;
  protected abstract handleKeyboardNavigation(e: KeyboardEvent): void;

  protected async handleInput() {
    clearTimeout(this.searchTimeout);
    const query = this.input.value.trim();

    if (!query) {
      this.results.innerHTML = '';
      return;
    }

    this.searchTimeout = setTimeout(async () => {
      try {
        this.searchResults = await searchPosts(query);
        this.renderResults();
      } catch (error) {
        console.error('Search error:', error);
        this.results.innerHTML = `
          <div class="py-4 px-6 text-center text-sm text-secondary-600 dark:text-secondary-400">
            <p>An error occurred while searching. Please try again.</p>
          </div>
        `;
      } finally {
        this.selectedIndex = -1;
      }
    }, 300);
  }

  protected updateSelection() {
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
}

// Blog search implementation
export class BlogSearchManager extends BaseSearchManager {
  constructor(elements: { input: HTMLInputElement; results: HTMLElement }) {
    super(elements);
    this.initializeEventListeners();
  }

  protected initializeEventListeners() {
    this.input.addEventListener('input', this.handleInput.bind(this));
    document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
  }

  protected renderResults() {
    if (this.searchResults.length === 0) {
      this.results.innerHTML = `
        <div class="py-4 px-6 text-center text-sm text-secondary-600 dark:text-secondary-400">
          <p>No matching articles found.</p>
        </div>
      `;
      return;
    }

    this.results.innerHTML = this.searchResults
      .map(
        (result, index) => `
          <a
            href="/blog/${result.slug}"
            class="block px-4 py-3 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors ${
              index === this.selectedIndex ? 'bg-secondary-50 dark:bg-secondary-700/50' : ''
            }"
            data-index="${index}"
          >
            <div class="flex items-center justify-between gap-4">
              <h3 class="text-sm font-medium text-secondary-900 dark:text-white">
                ${result.title}
              </h3>
              <span class="text-xs text-secondary-500 dark:text-secondary-400">
                ${result.category}
              </span>
            </div>
            <p class="text-xs text-secondary-600 dark:text-secondary-400 line-clamp-1 mt-1">
              ${result.description}
            </p>
          </a>
        `
      )
      .join('');
  }

  protected handleKeyboardNavigation(e: KeyboardEvent) {
    if (!this.results.children.length) return;

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
    }
  }
}

// Dialog search implementation
export class SearchDialog extends BaseSearchManager {
  private dialog: HTMLElement;
  private loadingIndicator: HTMLElement;

  constructor(elements: {
    dialog: HTMLElement;
    input: HTMLInputElement;
    results: HTMLElement;
    loadingIndicator: HTMLElement;
  }) {
    super({ input: elements.input, results: elements.results });
    this.dialog = elements.dialog;
    this.loadingIndicator = elements.loadingIndicator;
    this.initializeCloseButton();
  }

  protected initializeEventListeners() {
    this.input.addEventListener('input', this.handleInput.bind(this));
    document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));

    // Add dialog-specific event listeners
    document.addEventListener('keydown', (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        this.openDialog();
      }
    });
  }

  private initializeCloseButton() {
    const closeButton = document.querySelector('#close-search');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.closeDialog());
    }
  }

  private openDialog() {
    this.dialog.classList.remove('hidden');
    this.dialog.classList.add('block');
    this.input.focus();
  }

  private closeDialog() {
    this.dialog.classList.remove('block');
    this.dialog.classList.add('hidden');
    this.input.value = '';
    this.results.innerHTML = '';
    this.selectedIndex = -1;
  }

  protected renderResults() {
    if (this.searchResults.length === 0) {
      this.results.innerHTML = `
        <div class="py-14 px-6 text-center text-sm text-secondary-600 dark:text-secondary-400">
          <p>No matching articles found.</p>
        </div>
      `;
      return;
    }

    this.results.innerHTML = this.searchResults
      .map(
        (result, index) => `
          <a
            href="/blog/${result.slug}"
            class="block px-4 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors"
            data-index="${index}"
          >
            <div class="flex items-center justify-between gap-4 mb-1">
              <h3 class="text-sm font-medium text-secondary-900 dark:text-white">
                ${result.title}
              </h3>
              <span class="text-xs text-secondary-500 dark:text-secondary-400">
                ${result.category}
              </span>
            </div>
            <p class="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2">
              ${result.description}
            </p>
          </a>
        `
      )
      .join('');
  }

  protected handleKeyboardNavigation(e: KeyboardEvent) {
    if (!this.dialog.classList.contains('block')) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.closeDialog();
        break;
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
    }
  }
}

// Initialization functions
export function initializeBlogSearch() {
  const searchInput = document.querySelector('#blog-search-input') as HTMLInputElement;
  const searchResults = document.querySelector('#blog-search-results') as HTMLElement;

  if (!searchInput || !searchResults) return;

  new BlogSearchManager({
    input: searchInput,
    results: searchResults,
  });
}

export function initializeSearch() {
  const dialog = document.querySelector('#search-dialog') as HTMLElement;
  const searchInput = document.querySelector('#search-input') as HTMLInputElement;
  const searchResults = document.querySelector('#search-results') as HTMLElement;
  const loadingIndicator = document.querySelector('#search-loading') as HTMLElement;

  if (!dialog || !searchInput || !searchResults || !loadingIndicator) return;

  new SearchDialog({
    dialog,
    input: searchInput,
    results: searchResults,
    loadingIndicator,
  });
}

export function initializeCategoryFilter() {
  const categorySelect = document.querySelector('#category-select') as HTMLSelectElement;
  const blogCards = document.querySelectorAll('.blog-card') as NodeListOf<HTMLElement>;

  if (!categorySelect || !blogCards.length) return;

  categorySelect.addEventListener('change', (e) => {
    const selectedCategory = (e.target as HTMLSelectElement).value.toLowerCase();

    blogCards.forEach((card) => {
      const cardCategory = card.dataset.category?.toLowerCase();
      if (!selectedCategory || cardCategory === selectedCategory) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
}
