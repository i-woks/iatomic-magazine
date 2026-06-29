// Command processor reads a JSON object on stdin and writes text statistics
// as JSON on stdout. Used by the Node API as a heavy/background helper.
//
//	echo '{"text":"..."}' | processor
//
// Output: { word_count, estimated_reading_time, top_keywords, char_count, engine }
package main

import (
	"encoding/json"
	"io"
	"os"
	"regexp"
	"sort"
	"strings"
)

type input struct {
	Text string `json:"text"`
}

type output struct {
	WordCount            int      `json:"word_count"`
	CharCount            int      `json:"char_count"`
	EstimatedReadingTime int      `json:"estimated_reading_time"`
	TopKeywords          []string `json:"top_keywords"`
	Engine               string   `json:"engine"`
}

// Common Persian + English stopwords excluded from keyword scoring.
var stopwords = map[string]bool{
	"the": true, "and": true, "for": true, "with": true, "that": true,
	"this": true, "from": true, "are": true, "was": true, "were": true,
	"و": true, "در": true, "به": true, "از": true, "که": true, "را": true,
	"با": true, "این": true, "آن": true, "برای": true, "است": true, "های": true,
	"یک": true, "تا": true, "هم": true, "بر": true, "یا": true, "می": true,
}

var wordRe = regexp.MustCompile(`[\p{L}\p{N}]+`)

func main() {
	raw, _ := io.ReadAll(os.Stdin)
	var in input
	if len(strings.TrimSpace(string(raw))) > 0 {
		_ = json.Unmarshal(raw, &in)
	}

	words := wordRe.FindAllString(in.Text, -1)
	wordCount := len(words)

	freq := map[string]int{}
	for _, w := range words {
		lw := strings.ToLower(w)
		if len([]rune(lw)) < 3 || stopwords[lw] {
			continue
		}
		freq[lw]++
	}

	type kv struct {
		Key   string
		Count int
	}
	var pairs []kv
	for k, v := range freq {
		pairs = append(pairs, kv{k, v})
	}
	sort.Slice(pairs, func(i, j int) bool {
		if pairs[i].Count == pairs[j].Count {
			return pairs[i].Key < pairs[j].Key
		}
		return pairs[i].Count > pairs[j].Count
	})

	top := []string{}
	for i := 0; i < len(pairs) && i < 8; i++ {
		top = append(top, pairs[i].Key)
	}

	readingTime := (wordCount + 199) / 200
	if readingTime < 1 {
		readingTime = 1
	}

	out := output{
		WordCount:            wordCount,
		CharCount:            len([]rune(in.Text)),
		EstimatedReadingTime: readingTime,
		TopKeywords:          top,
		Engine:               "go-processor",
	}
	enc := json.NewEncoder(os.Stdout)
	enc.SetEscapeHTML(false)
	_ = enc.Encode(out)
}
