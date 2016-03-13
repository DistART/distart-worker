#!/usr/bin/env bash

self="$0"
image_path="$1"
pattern_path="$2"
out_path="$3"

th neural_style.lua -image_size 100 -num_iterations 500 -style_image "$pattern_path" -content_image "$out_path" -backend cudnn -output_image "$out_path"

#echo $self $image_path $pattern_path $out_path
#
#cat "$image_path" > "$out_path"
#cat "$pattern_path" >> "$out_path"

