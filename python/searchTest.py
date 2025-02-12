import json
import pandas as pd

def load_json_file(path):
    with open(path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    return pd.DataFrame(data)

# Load the JSON file
df = load_json_file('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2-17-01-2025/vids200601.json')

def load_mapping_file(path):
    with open(path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    if isinstance(data, list):
        return data
    else:
        # If it's not a list, we might need to convert it somehow, but for simplicity, we'll raise an error
        raise ValueError(f"Expected a list in JSON file at {path}, but got {type(data)}")
    
tags_mapping = load_mapping_file('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/tags.json')
niconico_users_mapping = load_mapping_file('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/niconicoUserList.json')
youtube_users_mapping = load_mapping_file('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList2.json')

def map_tags(tags):
    if not tags:
        return []
    return [tags_mapping[int(tag)] if str(tag).isdigit() else tag for tag in tags]
    
def get_user_id(entry):
    if 'uploader_id' in entry and entry['uploader_id']:
        return entry['uploader_id']
        
    if 'uId' in entry:
        uId = str(entry['uId'])
        
        # Determine which mapping to use based on the extractor_key
        if entry['extractor_key'] == 'Youtube':
            mapping = youtube_users_mapping
        elif entry['extractor_key'] == 'Niconico':
            mapping = niconico_users_mapping
        else:
            # Handle unexpected extractor_key or return None
            return None

        if uId.isdigit():
            return mapping[int(uId)] if int(uId) < len(mapping) else None
        else:
            return None

    return None

def get_entry(index):
    processed_entry = df.iloc[index].to_dict().copy()

    if 'tags' in processed_entry:
        processed_entry['tags'] = map_tags(processed_entry['tags'])
        
    processed_entry['uploader_id'] = get_user_id(processed_entry)
    
    return processed_entry

print(get_entry(0))