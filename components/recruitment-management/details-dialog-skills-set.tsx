import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Define your data structure
const skillCategories = [
    {
        name: "Design",
        skills: ["UI/UX Principles", "Typography", "Color Theory", "Wireframing", "Prototyping"],
        software: ["Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator"]
    },
    {
        name: "SEO (Search Engine Optimization)",
        skills: ["Keyword Research", "On-Page SEO", "Off-Page SEO", "Technical SEO", "Link Building"],
        software: ["Ahrefs", "SEMrush", "Google Analytics", "Google Search Console", "Screaming Frog"]
    },
    {
        name: "Development (Frontend)",
        skills: ["HTML5", "CSS3", "JavaScript (ES6+)", "React", "Vue.js", "TypeScript"],
        software: ["VS Code", "Git", "npm/yarn", "Webpack", "Browser DevTools"]
    },
    {
        name: "Development (Backend)",
        skills: ["Node.js", "Python (Django/Flask)", "REST APIs", "GraphQL", "Database Management (SQL/NoSQL)"],
        software: ["Postman", "Docker", "Kubernetes", "AWS/GCP/Azure", "MongoDB Compass"]
    }
];

export function SkillSet() {
    return (
        <div className="space-y-4">
            <Accordion type="multiple" className="w-full">
                {skillCategories.map((category) => (
                    <AccordionItem value={category.name} key={category.name}>
                        <AccordionTrigger className="text-lg font-medium">
                            {category.name}
                        </AccordionTrigger>
                        <AccordionContent>
                            {/* Grid to create the two-column layout for Skills/Software */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 px-1">

                                {/* Skills Section */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-md text-primary">Skills</h3>
                                    <div className="space-y-2">
                                        {category.skills.map((skill) => (
                                            <div className="flex items-center space-x-2" key={skill}>
                                                <Checkbox id={`${category.name}-${skill}`} />
                                                <Label
                                                    htmlFor={`${category.name}-${skill}`}
                                                    className="font-normal"
                                                >
                                                    {skill}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Software Used Section */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-md text-primary">Software Used</h3>
                                    <div className="space-y-2">
                                        {category.software.map((sw) => (
                                            <div className="flex items-center space-x-2" key={sw}>
                                                <Checkbox id={`${category.name}-${sw}`} />
                                                <Label
                                                    htmlFor={`${category.name}-${sw}`}
                                                    className="font-normal"
                                                >
                                                    {sw}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
