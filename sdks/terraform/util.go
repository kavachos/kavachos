package main

import "regexp"

// slugRegexp returns the pattern for a valid URL-safe slug.
// Slugs must be lowercase alphanumeric, with hyphens allowed between characters.
func slugRegexp() *regexp.Regexp {
	return regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)
}
