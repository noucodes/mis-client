export default async function Page() {
    return (
        <main className="space-y-8">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Employee Management</span>
                    <span>/</span>
                    <span>Info</span>
                </div>
                <h1 className="text-3xl font-bold text-balance">Employee Info</h1>
                <p className="text-muted-foreground text-balance">
                    Manage your employees info and data
                </p>
            </div>

        </main>
    );
}