# InfoWindow Configuration

The InfoWindow component now uses a JSON configuration file for easy content management.

## Configuration File

The content is stored in: `src/data/infoWindowData.json`

## Structure

```json
{
  "title": "Window title",
  "subtitle": "Window subtitle", 
  "sections": [
    {
      "id": "unique-section-id",
      "title": "Section Title",
      "icon": "icon-name",
      "iconColor": "text-color-class",
      "content": {
        // Section-specific content
      }
    }
  ]
}
```

## Available Icons

The following icons are available in `src/utils/iconUtils.js`:
- `user` - User profile icon
- `windows` - Windows logo icon  
- `computer` - Computer/monitor icon
- `network` - Network icon
- `shield` - Security/activation icon
- `contact` - Contact icon
- `email` - Email icon
- `linkedin` - LinkedIn icon
- `github` - GitHub icon

## Supported Sections

### About Me (`id: "about"`)
- `content.greeting` - Opening greeting text
- `content.description` - Detailed description

### OS Edition (`id: "os"`)
- `content.edition` - OS version information
- `content.copyright` - Copyright notice

### System Information (`id: "system"`)
- `content.cpu` - CPU specifications with name and specs array
- `content.memory` - Memory breakdown with total and breakdown array
- `content.cache` - Cache levels array
- `content.apu` - Audio processor information
- `content.storage` - Storage devices array
- `content.architecture` - System architecture details

### Computer Info (`id: "computer-info"`)
- `content.computerName` - Computer name
- `content.fullComputerName` - Full computer name
- `content.description` - Computer description
- `content.workgroup` - Workgroup name

### Activation (`id: "activation"`)
- `content.status` - Activation status message
- `content.isActivated` - Boolean activation state

### Contact (`id: "contact"`)
- `content.description` - Contact section description
- `content.links` - Array of contact links with type, label, url, and color
- `content.footer` - Footer text

## Color Classes

Available colors for components (used in `getColorClass` function):
- `blue` → `bg-blue-500`
- `green` → `bg-green-500` 
- `red` → `bg-red-500`
- `orange` → `bg-orange-500`
- `purple` → `bg-purple-500`
- `pink` → `bg-pink-500`
- `gray` → `bg-gray-500`
- `yellow` → `bg-yellow-500`
- `indigo` → `bg-indigo-500`

## Customization

To modify the InfoWindow content:

1. Edit `src/data/infoWindowData.json`
2. Update any text, URLs, or configuration
3. Add new icons to `src/utils/iconUtils.js` if needed
4. The component will automatically reflect changes

## Adding New Sections

To add a new section type:

1. Add the section to the JSON file
2. Add a new `if` condition in the InfoWindow component's section mapping
3. Create the appropriate JSX structure for your new section type
