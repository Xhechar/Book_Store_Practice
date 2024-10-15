BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [user_id] NVARCHAR(255) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [phone] INT NOT NULL,
    [email] NVARCHAR(255) NOT NULL,
    [password] NVARCHAR(255) NOT NULL,
    [role] NVARCHAR(255) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'user',
    [isWelcomed] BIT NOT NULL CONSTRAINT [User_isWelcomed_df] DEFAULT 0,
    [isDeleted] BIT NOT NULL CONSTRAINT [User_isDeleted_df] DEFAULT 0,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([user_id]),
    CONSTRAINT [User_user_id_key] UNIQUE NONCLUSTERED ([user_id]),
    CONSTRAINT [User_phone_key] UNIQUE NONCLUSTERED ([phone]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Book] (
    [book_id] NVARCHAR(255) NOT NULL,
    [title] NVARCHAR(255) NOT NULL,
    [user_id] NVARCHAR(255) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Book_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Book_pkey] PRIMARY KEY CLUSTERED ([book_id]),
    CONSTRAINT [Book_book_id_key] UNIQUE NONCLUSTERED ([book_id])
);

-- CreateTable
CREATE TABLE [dbo].[Favourite] (
    [favourite_id] NVARCHAR(255) NOT NULL,
    [user_id] NVARCHAR(255) NOT NULL,
    [book_id] NVARCHAR(255) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Favourite_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Favourite_pkey] PRIMARY KEY CLUSTERED ([favourite_id]),
    CONSTRAINT [Favourite_favourite_id_key] UNIQUE NONCLUSTERED ([favourite_id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Book] ADD CONSTRAINT [Book_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[User]([user_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Favourite] ADD CONSTRAINT [Favourite_book_id_fkey] FOREIGN KEY ([book_id]) REFERENCES [dbo].[Book]([book_id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
