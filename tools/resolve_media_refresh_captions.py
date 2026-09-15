"""Submit this source to native Resolve run_script, then call style_clips.

The injected Resolve object is required. No filesystem or process operations.
English TextPlus captions use the established 1080p film layout, preserving the
entire game frame above a separate caption margin.
"""

PROJECT_ID = '61f93e79-f0da-4a95-b3ea-ed44f06745a1'
TIMELINE_ID = 'bba22e25-b110-4f09-a9ae-8da4f1efbd8f'


def style_clips(indices, captions):
    project = resolve.GetProjectManager().GetCurrentProject()
    timeline = project.GetCurrentTimeline()
    assert project.GetUniqueId() == PROJECT_ID
    assert timeline.GetUniqueId() == TIMELINE_ID
    items = timeline.GetItemListInTrack('video', 1)
    results = []
    for index in indices:
        item = items[index]
        assert item.GetFusionCompCount() == 0, 'Inspect existing composition before retrying'
        comp = item.AddFusionComp()
        assert comp
        comp.Lock()
        try:
            media_in = comp.FindTool('MediaIn1')
            media_out = comp.FindTool('MediaOut1')
            assert media_in and media_out
            background = comp.AddTool('Background')
            resize = comp.AddTool('BetterResize')
            game_merge = comp.AddTool('Merge')
            text = comp.AddTool('TextPlus')
            caption_merge = comp.AddTool('Merge')
            settings = [
                (background, {'UseFrameFormatSettings': 0, 'Width': 1920, 'Height': 1080,
                              'TopLeftRed': .025, 'TopLeftGreen': .045, 'TopLeftBlue': .065, 'TopLeftAlpha': 1}),
                (resize, {'Width': 1728, 'Height': 972, 'HiQOnly': 0}),
                (game_merge, {'Center': {1: .5, 2: .55}, 'Size': 1}),
                (text, {'StyledText': captions[index], 'Font': 'Arial', 'Style': 'Regular',
                        'Size': .0165, 'Center': {1: .5, 2: .05}, 'LayoutType': 0,
                        'HorizontalJustificationNew': 3, 'VerticalJustificationNew': 3,
                        'Red1': .93, 'Green1': .98, 'Blue1': .97, 'LineSpacing': 1}),
            ]
            for tool, values in settings:
                for key, value in values.items():
                    tool.SetInput(key, value, 0)
            assert resize.ConnectInput('Input', media_in)
            assert game_merge.ConnectInput('Background', background)
            assert game_merge.ConnectInput('Foreground', resize)
            assert caption_merge.ConnectInput('Background', game_merge)
            assert caption_merge.ConnectInput('Foreground', text)
            assert media_out.ConnectInput('Input', caption_merge)
            # The inherited template creates stereo output nodes for this 2D
            # source. Feed the same finished composition to either output.
            media_out_right = comp.FindTool('MediaOut2')
            if media_out_right:
                assert media_out_right.ConnectInput('Input', caption_merge)
        finally:
            comp.Unlock()
        # Adding a composition stores it but does not activate it for the edit
        # or Deliver pages. Explicitly select the newly created composition.
        assert item.LoadFusionCompByName(item.GetFusionCompNameList()[0])
        # In 21.1, a locked graph can retain the old output after Unlock.
        # Notify the renderer after the graph is unlocked, then verify pixels.
        resize.ConnectInput('Input', media_in)
        game_merge.ConnectInput('Background', background)
        game_merge.ConnectInput('Foreground', resize)
        caption_merge.ConnectInput('Background', game_merge)
        caption_merge.ConnectInput('Foreground', text)
        media_out.ConnectInput('Input', caption_merge)
        if media_out_right:
            media_out_right.ConnectInput('Input', caption_merge)
        resize.SetInput('Width', 1727)
        resize.SetInput('Width', 1728)
        text.SetInput('Size', .0166)
        text.SetInput('Size', .0165)
        assert text.GetInput('StyledText') == captions[index]
        results.append({'index': index, 'id': item.GetUniqueId(), 'caption': text.GetInput('StyledText'),
                        'start': item.GetStart(), 'end': item.GetEnd(), 'duration': item.GetDuration()})
    assert resolve.GetProjectManager().SaveProject()
    return results
