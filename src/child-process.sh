#!/usr/bin/env bash

self="$0"
image_path="$1"
pattern_path="$2"
out_path="$3"

echo $self $image_path $pattern_path $out_path

cat "$image_path" > "$out_path"
cat "$pattern_path" >> "$out_path"

