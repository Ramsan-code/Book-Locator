"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Globe, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container py-12 px-4">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          About Book Locator
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connecting book lovers, one story at a time. We believe in the power
          of sharing knowledge and stories within our community.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        {[
          { icon: BookOpen, label: "Books Listed", value: "10+" },
          { icon: Users, label: "Active Readers", value: "5+" },
          { icon: Globe, label: "Cities Covered", value: "5+" },
          { icon: Award, label: "Happy Exchanges", value: "2+" },
        ].map((stat, index) => (
          <Card
            key={index}
            className="text-center border-none shadow-none bg-muted/30"
          >
            <CardContent className="pt-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-4 text-success">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mission Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            Book Locator was founded with a simple mission: to make books
            accessible to everyone. We understand that buying new books can be
            expensive, and many great stories sit gathering dust on shelves.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            By creating a platform for book enthusiasts to list, share, and
            request books, we're building a sustainable community of readers who
            support each other's passion for learning and storytelling.
          </p>
        </div>
        <div className="relative h-[400px] rounded-2xl overflow-hidden bg-muted">
          <img
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000&auto=format&fit=crop"
            alt="Library"
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Thaventhiran Ramsan",
              role: "Founder & CEO",
              // image: "client/public/image/me.jpg",
              image:
                "https://res.cloudinary.com/duopmqsxf/image/upload/v1765597664/book-locator/vhjbzfhewjlaqsu6bjzr.jpg",
            },
            {
              name: "Sujeethan",
              role: "Head of Technology",
              image:
                "https://res.cloudinary.com/duopmqsxf/image/upload/v1765597664/book-locator/m6bwnxcomhqpbvlhifch.jpg",
            },
            {
              name: "Kiruthuja",
              role: "Community Manager",
              image:
                "https://res.cloudinary.com/duopmqsxf/image/upload/v1765597664/book-locator/zisa5dzv2os2he2jxgde.jpg",
            },
          ].map((member, index) => (
            <div key={index} className="text-center group">
              <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
              <p className="text-muted-foreground">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
