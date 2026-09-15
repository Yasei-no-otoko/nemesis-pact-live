"""Run in native Resolve, then call assemble(plan, compatibility_path)."""


def assemble(plan, compatibility_path):
    manager = resolve.GetProjectManager()
    project = manager.GetCurrentProject()
    assert project.GetUniqueId() == '61f93e79-f0da-4a95-b3ea-ed44f06745a1'
    timeline = next(project.GetTimelineByIndex(n) for n in range(1, project.GetTimelineCount() + 1)
                    if project.GetTimelineByIndex(n).GetUniqueId() == 'bba22e25-b110-4f09-a9ae-8da4f1efbd8f')
    assert project.SetCurrentTimeline(timeline)
    assert not timeline.GetItemListInTrack('video', 1), 'Inspect existing work before retrying'
    assert float(timeline.GetSettings()['timelineFrameRate']) == 60
    pool = project.GetMediaPool()
    imported = pool.ImportMedia([compatibility_path])
    assert imported and len(imported) == 1
    source = imported[0]
    assert float(source.GetClipProperty('FPS')) == 60
    start = timeline.GetStartFrame()
    added = pool.AppendToTimeline([{'mediaPoolItem': source, 'startFrame': c['sourceInFrame'],
                                   'endFrame': c['sourceOutFrameExclusive'],
                                   'recordFrame': start + c['recordOffset']} for c in plan['clips']])
    assert added
    video = timeline.GetItemListInTrack('video', 1)
    sound = timeline.GetItemListInTrack('audio', 1)
    assert len(video) == len(sound) == len(plan['clips'])
    evidence = []
    for clip, v, a in zip(plan['clips'], video, sound):
        for item in (v, a):
            assert item.GetDuration() == clip['frames']
            assert item.GetStart() == start + clip['recordOffset']
            assert item.GetSourceStartFrame() == clip['sourceInFrame']
            assert item.GetSourceEndFrame() == clip['sourceOutFrameExclusive']
        assert timeline.SetClipsLinked([v, a], True)
        assert timeline.AddMarker(clip['recordOffset'], 'Cyan', clip['label'], clip['caption'], clip['frames'])
        evidence.append({'label': clip['label'], 'videoId': v.GetUniqueId(), 'audioId': a.GetUniqueId(),
                         'start': v.GetStart(), 'end': v.GetEnd(), 'sourceIn': v.GetSourceStartFrame(),
                         'sourceOutExclusive': v.GetSourceEndFrame(), 'frames': v.GetDuration(),
                         'linked': len(v.GetLinkedItems()) > 0})
    assert timeline.GetEndFrame() - start == 3540
    assert manager.SaveProject()
    return {'timelineId': timeline.GetUniqueId(), 'timelineName': timeline.GetName(), 'sourceId': source.GetUniqueId(),
            'frames': timeline.GetEndFrame() - start, 'clips': evidence}
