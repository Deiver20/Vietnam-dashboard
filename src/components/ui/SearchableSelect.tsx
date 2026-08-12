"use client";

import { useState, useRef, useEffect, useMemo, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X, Check, Search } from "lucide-react";

interface SearchableSelectProps {
  label: string;
  options: string[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  multiple?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const VISIBLE_COUNT = 50;
const LOAD_MORE_THRESHOLD = 100;

export function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  multiple = false,
  loading = false,
  disabled = false,
  className = "",
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(VISIBLE_COUNT);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [scopeClass, setScopeClass] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;

  const selectedValues = useMemo(() => {
    if (multiple) return Array.isArray(value) ? value : [];
    return value ? [value as string] : [];
  }, [value, multiple]);

  const hasSelection = selectedValues.length > 0;

  const filteredOptions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) => option.toLowerCase().includes(term));
  }, [options, search]);

  const visibleOptions = useMemo(
    () => filteredOptions.slice(0, visibleCount),
    [filteredOptions, visibleCount]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const listbox = document.getElementById(listboxId);
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !(listbox && listbox.contains(event.target as Node))
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, listboxId]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleOpen = () => {
    if (!disabled && !loading) {
      setSearch("");
      setVisibleCount(VISIBLE_COUNT);
      setOpen(true);
    }
  };

  const handleToggle = () => {
    if (!disabled && !loading) {
      if (!open) {
        setSearch("");
        setVisibleCount(VISIBLE_COUNT);
        const scope = containerRef.current?.closest(".trade-scope");
        setScopeClass(
          scope && scope.classList.contains("trade-scope-light")
            ? "trade-scope-light"
            : scope
              ? "trade-scope-dark"
              : ""
        );
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + window.scrollY + 6,
            left: rect.left + window.scrollX,
            width: rect.width,
          });
        }
      }
      setOpen((prev) => !prev);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setVisibleCount(VISIBLE_COUNT);
  };

  const clearSearch = () => {
    setSearch("");
    setVisibleCount(VISIBLE_COUNT);
    inputRef.current?.focus();
  };

  const handleSelect = useCallback(
    (option: string) => {
      if (multiple) {
        const current = Array.isArray(value) ? value : [];
        const normalizedOption = option.toLowerCase();
        const existingIndex = current.findIndex(v => v.toLowerCase() === normalizedOption);
        const updated = existingIndex >= 0
          ? current.filter((_, i) => i !== existingIndex)
          : [...current, option];
        onChange(updated);
      } else {
        onChange(option);
        setOpen(false);
        setSearch("");
        setVisibleCount(VISIBLE_COUNT);
      }
    },
    [multiple, onChange, value]
  );

  const handleClear = () => {
    if (multiple) {
      onChange([]);
    } else {
      onChange("");
    }
    setSearch("");
    setVisibleCount(VISIBLE_COUNT);
  };

  const handleListScroll = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const { scrollTop, scrollHeight, clientHeight } = list;
    if (scrollHeight - scrollTop - clientHeight < LOAD_MORE_THRESHOLD) {
      setVisibleCount((prev) => Math.min(prev + VISIBLE_COUNT, filteredOptions.length));
    }
  }, [filteredOptions.length]);

  const isSelected = (option: string) =>
    selectedValues.some((v) => v.toLowerCase() === option.toLowerCase());

  const displayValue = useMemo(() => {
    if (selectedValues.length === 0) return placeholder;
    if (!multiple) return selectedValues[0];
    if (selectedValues.length === 1) return selectedValues[0];
    return `${selectedValues[0]} +${selectedValues.length - 1}`;
  }, [selectedValues, multiple, placeholder]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <label className="block text-[11px] text-gray-4 uppercase tracking-wider font-semibold mb-1.5">
        {label}
      </label>

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          id={`${listboxId}-trigger`}
          onClick={handleToggle}
          disabled={disabled || loading}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          className={`
            w-full flex items-center justify-between gap-2
            bg-navy-darker border rounded-sm px-3 py-2
            text-sm text-left transition-all
            ${open ? "border-blue ring-1 ring-blue/30" : "border-navy-line hover:border-blue/50"}
            ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <span
            className={`truncate ${
              hasSelection ? "text-white font-medium" : "text-gray-5"
            }`}
          >
            {displayValue}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-4 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {hasSelection && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear selection"
            className="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-navy-line text-gray-4 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && createPortal(
        <div
          id={listboxId}
          role="listbox"
          aria-multiselectable={multiple}
          data-native-wheel
          className={`fixed z-[9999] bg-navy-card border border-navy-line rounded-md shadow-xl overflow-hidden trade-scope ${scopeClass}`}
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
          }}
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-navy-line">
            <Search className="w-4 h-4 text-gray-5 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-5 focus:outline-none min-w-0"
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="p-0.5 rounded hover:bg-navy-line text-gray-4 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div
            ref={listRef}
            onScroll={handleListScroll}
            className="max-h-64 overflow-y-auto p-1"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-4 text-center">
                No results
              </div>
            ) : (
              <>
                {visibleOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={isSelected(option)}
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-sm text-sm text-left transition-colors
                      ${isSelected(option) ? "bg-blue/15 text-white" : "text-gray-3 hover:bg-navy-mid hover:text-white"}
                    `}
                  >
                    {multiple ? (
                      <span
                        aria-hidden="true"
                        className={`
                          w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0
                          ${isSelected(option) ? "bg-blue border-blue" : "border-gray-5"}
                        `}
                      >
                        {isSelected(option) && <Check className="w-3 h-3 text-white trade-keep-white" />}
                      </span>
                    ) : (
                      <span
                        aria-hidden="true"
                        className={`
                          w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0
                          ${isSelected(option) ? "border-blue" : "border-gray-5"}
                        `}
                      >
                        {isSelected(option) && (
                          <span className="w-2 h-2 rounded-full bg-blue" />
                        )}
                      </span>
                    )}
                    <span className="truncate" title={option}>
                      {option}
                    </span>
                  </button>
                ))}
                {visibleOptions.length < filteredOptions.length && (
                  <div className="px-3 py-2 text-center text-xs text-gray-5">
                    Loading more...
                  </div>
                )}
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
