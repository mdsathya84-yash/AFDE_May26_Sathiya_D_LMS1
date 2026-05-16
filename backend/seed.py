"""Seed the database with test data via the live API."""
import httpx

BASE = "http://localhost:8000/api/v1"

BOOKS = [
    {"title": "Clean Code", "author": "Robert C. Martin", "category": "Software Engineering",
     "isbn": "9780132350884", "description": "A handbook of agile software craftsmanship covering best practices for writing readable, maintainable code.", "tags": "refactoring,best practices,agile,software design"},
    {"title": "The Pragmatic Programmer", "author": "David Thomas", "category": "Software Engineering",
     "isbn": "9780135957059", "description": "From journeyman to master - timeless advice for software developers on pragmatic approaches to coding.", "tags": "career,best practices,software craftsmanship"},
    {"title": "Design Patterns", "author": "Gang of Four", "category": "Software Engineering",
     "isbn": "9780201633610", "description": "Elements of reusable object-oriented software. The classic reference for design patterns.", "tags": "OOP,patterns,architecture,reusability"},
    {"title": "Introduction to Algorithms", "author": "Thomas H. Cormen", "category": "Computer Science",
     "isbn": "9780262046305", "description": "Comprehensive coverage of algorithms and data structures, widely used as a university textbook.", "tags": "algorithms,data structures,complexity,computer science"},
    {"title": "The Mythical Man-Month", "author": "Frederick P. Brooks Jr.", "category": "Software Engineering",
     "isbn": "9780201835953", "description": "Essays on software engineering exploring why adding manpower to a late project makes it later.", "tags": "project management,software teams,classic"},
    {"title": "Deep Learning", "author": "Ian Goodfellow", "category": "Artificial Intelligence",
     "isbn": "9780262035613", "description": "Authoritative textbook on deep learning covering neural networks, optimization, and generative models.", "tags": "neural networks,machine learning,AI,deep learning"},
    {"title": "Python Crash Course", "author": "Eric Matthes", "category": "Programming",
     "isbn": "9781593279288", "description": "A hands-on, project-based introduction to Python programming for beginners.", "tags": "python,beginner,projects,programming"},
    {"title": "Fluent Python", "author": "Luciano Ramalho", "category": "Programming",
     "isbn": "9781492056355", "description": "Clear, concise, and effective programming with Python. Covers idiomatic Python and advanced language features.", "tags": "python,advanced,idiomatic,data model"},
    {"title": "Database Internals", "author": "Alex Petrov", "category": "Databases",
     "isbn": "9781492040347", "description": "A deep dive into how databases are designed and built, covering storage engines and distributed systems.", "tags": "databases,storage engines,distributed,internals"},
    {"title": "Designing Data-Intensive Applications", "author": "Martin Kleppmann", "category": "Databases",
     "isbn": "9781449373320", "description": "The big ideas behind reliable, scalable, and maintainable systems. Essential reading for backend engineers.", "tags": "distributed systems,scalability,reliability,data engineering"},
    {"title": "The Art of War", "author": "Sun Tzu", "category": "Philosophy",
     "isbn": "9780140455526", "description": "Ancient Chinese military treatise, widely read as a guide to strategy and leadership.", "tags": "strategy,leadership,classic,philosophy"},
    {"title": "Atomic Habits", "author": "James Clear", "category": "Self Development",
     "isbn": "9780735211292", "description": "A proven framework for building good habits and breaking bad ones using small incremental changes.", "tags": "habits,productivity,self-improvement,psychology"},
]

BORROWERS = [
    {"borrower_name": "Alice Johnson",  "email": "alice.johnson@example.com",  "phone": "555-1001"},
    {"borrower_name": "Bob Smith",      "email": "bob.smith@example.com",      "phone": "555-1002"},
    {"borrower_name": "Carol Williams", "email": "carol.williams@example.com", "phone": "555-1003"},
    {"borrower_name": "David Lee",      "email": "david.lee@example.com",      "phone": "555-1004"},
    {"borrower_name": "Eva Martinez",   "email": "eva.martinez@example.com",   "phone": "555-1005"},
]


def post(path, payload):
    r = httpx.post(f"{BASE}{path}", json=payload)
    r.raise_for_status()
    return r.json()["data"]


def main():
    print("-- Seeding books ----------------------------")
    book_ids = []
    for b in BOOKS:
        result = post("/books", b)
        book_ids.append(result["book_id"])
        print(f"  + [{result['book_id']:>2}] {result['title']}")

    print("\n-- Seeding borrowers ------------------------")
    borrower_ids = []
    for b in BORROWERS:
        result = post("/borrowers", b)
        borrower_ids.append(result["borrower_id"])
        print(f"  + [{result['borrower_id']:>2}] {result['borrower_name']}")

    print("\n-- Creating borrow transactions -------------")
    borrows = [
        (book_ids[0], borrower_ids[0]),   # Clean Code -> Alice
        (book_ids[3], borrower_ids[1]),   # Intro to Algorithms -> Bob
        (book_ids[6], borrower_ids[2]),   # Python Crash Course -> Carol
        (book_ids[9], borrower_ids[3]),   # Designing Data-Intensive Apps -> David
        (book_ids[5], borrower_ids[4]),   # Deep Learning -> Eva
    ]
    txn_ids = []
    for book_id, borrower_id in borrows:
        result = post("/borrow", {"book_id": book_id, "borrower_id": borrower_id})
        txn_ids.append(result["transaction_id"])
        print(f"  + txn #{result['transaction_id']:>2}  {result['book_title']} -> {result['borrower_name']}")

    print("\n-- Returning one book -----------------------")
    r = post("/return", {"transaction_id": txn_ids[2]})
    print(f"  + Returned: {r['book_title']} (txn #{r['transaction_id']})")

    print("\nSeed complete.")
    print(f"   {len(BOOKS)} books  |  {len(BORROWERS)} borrowers  |  {len(borrows)} borrows  |  1 return")


if __name__ == "__main__":
    main()
